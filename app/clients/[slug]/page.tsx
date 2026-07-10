import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/Header";
import { H2 } from "@/components/ui";

export default async function ClientPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    redirect("/login");
  }

  const { data: client } = await supabase
    .from("clients")
    .select("name, status")
    .eq("slug", slug)
    .maybeSingle();

  if (!client) {
    notFound();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Header userEmail={userData.user.email!} back={{ href: "/", label: "← All clients" }} />
      <div style={{ padding: "10px 40px 60px", maxWidth: 1150, margin: "0 auto", width: "100%" }}>
        <H2 hint="Intake, QA review and model results for this client are coming next.">
          {client.name}
        </H2>
      </div>
    </div>
  );
}
