import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/Header";
import { ExampleModel } from "@/components/ExampleModel";

export default async function ExamplePage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    redirect("/login");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Header userEmail={userData.user.email!} back={{ href: "/", label: "← All clients" }} />
      <div style={{ padding: "10px 40px 60px", maxWidth: 1150, margin: "0 auto", width: "100%" }}>
        <ExampleModel />
      </div>
    </div>
  );
}
