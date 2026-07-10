import { notFound } from "next/navigation";
import { H2, cardStyle, CHARCOAL } from "@/components/ui";
import { getClientBySlug } from "@/lib/clients";

export default async function ModelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const client = await getClientBySlug(slug);
  if (!client) {
    notFound();
  }

  return (
    <>
      <H2 hint="Revenue decomposition, ROI by channel, response curves, and the budget optimiser will live here once a dataset is approved.">
        Model Results
      </H2>
      <div style={{ ...cardStyle, padding: 22 }}>
        <p style={{ fontSize: 13, color: CHARCOAL, margin: 0, lineHeight: 1.6 }}>
          This tab unlocks once a dataset for this client is signed off in QA Review. The modelling
          engine itself (Bayesian MMM with adstock/saturation) hasn&apos;t been built yet — that&apos;s a
          separate piece of work from the app you&apos;re looking at now.
        </p>
      </div>
    </>
  );
}
