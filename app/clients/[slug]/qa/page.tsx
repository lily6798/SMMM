import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { H2, cardStyle, CHARCOAL } from "@/components/ui";
import { getClientBySlug } from "@/lib/clients";

export default async function QaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const client = await getClientBySlug(slug);
  if (!client) {
    notFound();
  }

  const supabase = await createClient();
  const { data: datasets } = await supabase
    .from("datasets")
    .select("id, version, status, created_at")
    .eq("client_id", client.id)
    .order("version", { ascending: false });

  const latest = datasets?.[0];

  return (
    <>
      <H2 hint="Every parsed row shown here, fully overrideable, with an audit trail. Comes from whatever's been uploaded in Step 1.">
        QA Review
      </H2>
      <div style={{ ...cardStyle, padding: 22 }}>
        {!latest ? (
          <p style={{ fontSize: 13, color: CHARCOAL, margin: 0, lineHeight: 1.6 }}>
            No data has been parsed for this client yet. Complete intake (Step 1) first — once files
            are uploaded and parsed into a dataset, the weekly rows and any data-quality flags will
            show up here for review and sign-off.
          </p>
        ) : (
          <p style={{ fontSize: 13, color: CHARCOAL, margin: 0, lineHeight: 1.6 }}>
            Dataset v{latest.version} — status: {latest.status}. (Weekly row editor and flags list not
            built yet.)
          </p>
        )}
      </div>
    </>
  );
}
