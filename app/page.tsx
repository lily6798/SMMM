import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";

export default async function Home() {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    redirect("/login");
  }

  const { data: clients, error } = await supabase
    .from("clients")
    .select("name, status")
    .order("name");

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col gap-6 py-16 px-16">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
            Clients
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {userData.user.email}
            </span>
            <form action={signOut}>
              <button className="text-sm font-medium text-black underline dark:text-zinc-50">
                Sign out
              </button>
            </form>
          </div>
        </div>

        {error && (
          <p className="text-red-600 dark:text-red-400">
            Failed to load clients: {error.message}
          </p>
        )}

        {!error && clients?.length === 0 && (
          <p className="text-zinc-600 dark:text-zinc-400">
            No clients found.
          </p>
        )}

        {clients && clients.length > 0 && (
          <ul className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
            {clients.map((client) => (
              <li
                key={client.name}
                className="flex items-center justify-between py-3"
              >
                <span className="text-black dark:text-zinc-50">
                  {client.name}
                </span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {client.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
