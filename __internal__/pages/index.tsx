import Head from "next/head";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Head>
        <title>Composio SDK Challenge</title>
        <meta name="description" content="Composio SDK Design Challenge" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-zinc-900 text-white py-4">
        <div className="max-w-screen-lg mx-auto px-4">
          <h1 className="text-lg font-medium">Composio SDK Challenge</h1>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-md shadow p-6 border border-zinc-200">
          <h2 className="text-base font-medium text-zinc-900 mb-3">
            Composio SDK Challenge
          </h2>
          <p className="text-sm text-zinc-600 mb-6">
            Platform for administering the SDK design challenge for candidates.
          </p>

          <div>
            <Link
              href="/admin"
              className="block w-full py-2 px-3 text-center text-sm font-medium text-white bg-zinc-900 rounded-md hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900"
            >
              Admin Dashboard
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-4 border-t border-zinc-200 mt-auto">
        <div className="max-w-screen-lg mx-auto px-4 text-center">
          <p className="text-xs text-zinc-500">
            &copy; {new Date().getFullYear()} Composio. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
