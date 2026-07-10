"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateDataCoverage(
  clientId: string,
  slug: string,
  formData: FormData,
) {
  const supabase = await createClient();

  const kpiDataFrom = (formData.get("kpi_data_from") as string) || null;
  const mediaDataFrom = (formData.get("media_data_from") as string) || null;

  const { error } = await supabase
    .from("clients")
    .update({ kpi_data_from: kpiDataFrom, media_data_from: mediaDataFrom })
    .eq("id", clientId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/clients/${slug}`);
  revalidatePath("/");
}
