"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function overrideWeeklyField(
  weeklyDataId: string,
  fieldName: string,
  newValue: string,
  slug: string,
): Promise<{ ok: boolean; message: string }> {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { ok: false, message: "Not signed in." };
  }

  const { data: row, error: fetchError } = await supabase
    .from("weekly_data")
    .select(fieldName)
    .eq("id", weeklyDataId)
    .single();
  if (fetchError || !row) {
    return { ok: false, message: fetchError?.message ?? "Row not found." };
  }

  const originalValue = (row as unknown as Record<string, unknown>)[fieldName];

  const { error: updateError } = await supabase
    .from("weekly_data")
    .update({ [fieldName]: newValue === "" ? null : newValue })
    .eq("id", weeklyDataId);
  if (updateError) {
    return { ok: false, message: updateError.message };
  }

  await supabase.from("overrides").insert({
    weekly_data_id: weeklyDataId,
    field_name: fieldName,
    original_value: originalValue === null || originalValue === undefined ? null : String(originalValue),
    new_value: newValue === "" ? null : newValue,
    overridden_by: userData.user.id,
  });

  revalidatePath(`/clients/${slug}/qa`);
  return { ok: true, message: "Saved." };
}

export async function resolveFlag(
  flagId: string,
  slug: string,
): Promise<{ ok: boolean; message: string }> {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { ok: false, message: "Not signed in." };
  }

  const { error } = await supabase
    .from("flags")
    .update({ resolved: true, resolved_by: userData.user.id, resolved_at: new Date().toISOString() })
    .eq("id", flagId);
  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath(`/clients/${slug}/qa`);
  return { ok: true, message: "Resolved." };
}

export async function signOffDataset(
  datasetId: string,
  slug: string,
): Promise<{ ok: boolean; message: string }> {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { ok: false, message: "Not signed in." };
  }

  const { count: openBlockersOrWarnings } = await supabase
    .from("flags")
    .select("id", { count: "exact", head: true })
    .eq("dataset_id", datasetId)
    .eq("resolved", false)
    .in("level", ["blocker", "warning"]);

  if (openBlockersOrWarnings && openBlockersOrWarnings > 0) {
    return { ok: false, message: "Resolve all blocker/warning flags before signing off." };
  }

  const { error } = await supabase
    .from("datasets")
    .update({ status: "approved", signed_off_by: userData.user.id, signed_off_at: new Date().toISOString() })
    .eq("id", datasetId);
  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath(`/clients/${slug}/qa`);
  revalidatePath(`/clients/${slug}/model`);
  revalidatePath(`/clients/${slug}`);
  return { ok: true, message: "Signed off — Model tab unlocked." };
}
