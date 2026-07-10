import { signIn, signUp } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <form className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-xl font-semibold text-black dark:text-zinc-50">
          SMMM
        </h1>

        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
            {error}
          </p>
        )}
        {message && (
          <p className="rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            {message}
          </p>
        )}

        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          Email
          <input
            name="email"
            type="email"
            required
            className="rounded-md border border-zinc-300 px-3 py-2 text-black dark:border-zinc-700 dark:text-zinc-50 dark:bg-zinc-900"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          Password
          <input
            name="password"
            type="password"
            required
            minLength={6}
            className="rounded-md border border-zinc-300 px-3 py-2 text-black dark:border-zinc-700 dark:text-zinc-50 dark:bg-zinc-900"
          />
        </label>

        <div className="flex gap-2 pt-2">
          <button
            formAction={signIn}
            className="flex-1 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
          >
            Sign in
          </button>
          <button
            formAction={signUp}
            className="flex-1 rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-black/[.04] dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-[#1a1a1a]"
          >
            Sign up
          </button>
        </div>
      </form>
    </div>
  );
}
