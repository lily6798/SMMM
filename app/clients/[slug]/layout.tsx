import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/Header";
import { StepNav } from "@/components/StepNav";
import { getClientBySlug } from "@/lib/clients";
import { LINE_GREY } from "@/components/ui";

export default async function ClientLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    redirect("/login");
  }

  const client = await getClientBySlug(slug);
  if (!client) {
    notFound();
  }

  const { data: approvedDataset } = await supabase
    .from("datasets")
    .select("id")
    .eq("client_id", client.id)
    .eq("status", "approved")
    .limit(1)
    .maybeSingle();

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Header userEmail={userData.user.email!} back={{ href: "/", label: "← All clients" }} />
      <div style={{ padding: "0 40px", borderBottom: `1px solid ${LINE_GREY}` }}>
        <div style={{ maxWidth: 1150, margin: "0 auto" }}>
          <div style={{ fontSize: 13, fontWeight: 700, margin: "10px 0 4px" }}>{client.name}</div>
          <StepNav slug={slug} modelUnlocked={!!approvedDataset} />
        </div>
      </div>
      <div style={{ padding: "10px 40px 60px", maxWidth: 1150, margin: "0 auto", width: "100%" }}>
        {children}
      </div>
    </div>
  );
}
