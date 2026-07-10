"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { extractWeeklyRows } from "@/lib/anthropic";
import { SLOT_COLUMNS } from "@/lib/uploads";
import { refreshFlags } from "@/lib/flags";
import { extractTextFromFile, SUPPORTED_EXTENSIONS } from "@/lib/parseFile";

export async function parseUpload(
  uploadId: string,
  slug: string,
): Promise<{ ok: boolean; message: string }> {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { ok: false, message: "Not signed in." };
  }

  const { data: upload, error: uploadFetchError } = await supabase
    .from("uploads")
    .select("id, client_id, slot, file_path, original_filename")
    .eq("id", uploadId)
    .single();
  if (uploadFetchError || !upload) {
    return { ok: false, message: uploadFetchError?.message ?? "Upload not found." };
  }

  const targetColumns = SLOT_COLUMNS[upload.slot] ?? [];
  if (targetColumns.length === 0) {
    return { ok: false, message: `No column mapping defined for slot "${upload.slot}" yet.` };
  }

  const { data: fileBlob, error: downloadError } = await supabase.storage
    .from("uploads")
    .download(upload.file_path);
  if (downloadError || !fileBlob) {
    return { ok: false, message: downloadError?.message ?? "Could not download file." };
  }

  const fileText = await extractTextFromFile(fileBlob, upload.original_filename);
  if (fileText === null) {
    return {
      ok: false,
      message: `Unsupported file type — SMMM can parse ${SUPPORTED_EXTENSIONS.join(", ")} files.`,
    };
  }
  if (fileText.trim().length === 0) {
    return { ok: false, message: "Couldn't extract any text from this file — it may be a scanned image PDF." };
  }

  const rows = await extractWeeklyRows(fileText, targetColumns);
  if (rows.length === 0) {
    return { ok: false, message: "Claude didn't find any weekly rows in this file." };
  }

  let dataset = (
    await supabase
      .from("datasets")
      .select("id, version")
      .eq("client_id", upload.client_id)
      .eq("status", "draft")
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle()
  ).data;

  if (!dataset) {
    const latest = (
      await supabase
        .from("datasets")
        .select("version")
        .eq("client_id", upload.client_id)
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle()
    ).data;
    const nextVersion = (latest?.version ?? 0) + 1;
    const { data: created, error: createError } = await supabase
      .from("datasets")
      .insert({ client_id: upload.client_id, version: nextVersion, status: "draft" })
      .select("id, version")
      .single();
    if (createError || !created) {
      return { ok: false, message: createError?.message ?? "Could not create dataset." };
    }
    dataset = created;
  }

  let inserted = 0;
  let updated = 0;
  for (const row of rows) {
    const { week_start, ...rest } = row;
    if (!week_start) continue;

    const existing = (
      await supabase
        .from("weekly_data")
        .select("id")
        .eq("dataset_id", dataset.id)
        .eq("week_start", week_start)
        .maybeSingle()
    ).data;

    if (existing) {
      const { error: updateError } = await supabase
        .from("weekly_data")
        .update({ ...rest, source: upload.slot })
        .eq("id", existing.id);
      if (updateError) return { ok: false, message: updateError.message };
      updated++;
    } else {
      const { error: insertError } = await supabase
        .from("weekly_data")
        .insert({ dataset_id: dataset.id, week_start, ...rest, source: upload.slot });
      if (insertError) return { ok: false, message: insertError.message };
      inserted++;
    }
  }

  await supabase.from("uploads").update({ dataset_id: dataset.id }).eq("id", upload.id);
  await refreshFlags(supabase, dataset.id);

  revalidatePath(`/clients/${slug}`);
  revalidatePath(`/clients/${slug}/qa`);

  return {
    ok: true,
    message: `Parsed ${rows.length} weeks into dataset v${dataset.version} (${inserted} new, ${updated} updated).`,
  };
}
