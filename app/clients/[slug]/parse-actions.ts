"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { extractWeeklyRows } from "@/lib/anthropic";
import { SLOT_COLUMNS, TEXT_EXTENSIONS } from "@/lib/uploads";

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

  const isText = TEXT_EXTENSIONS.some((ext) =>
    upload.original_filename.toLowerCase().endsWith(ext),
  );
  if (!isText) {
    return {
      ok: false,
      message: "Only CSV/TSV/TXT files can be parsed right now — Excel and PDF support is coming.",
    };
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
  const fileText = await fileBlob.text();

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

  revalidatePath(`/clients/${slug}`);
  revalidatePath(`/clients/${slug}/qa`);

  return {
    ok: true,
    message: `Parsed ${rows.length} weeks into dataset v${dataset.version} (${inserted} new, ${updated} updated).`,
  };
}
