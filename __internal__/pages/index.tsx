import Head from 'next/head';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Composio SDK Challenge</title>
        <meta name="description" content="Composio SDK Design Challenge" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <header className="bg-blue-600 text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Composio SDK Challenge</h1>
        </div>
      </header>
      
      <main className="container mx-auto p-4 flex items-center justify-center min-h-[70vh]">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to the Composio SDK Challenge</h2>
          <p className="text-gray-600 mb-6">
            This platform is used for administering the Composio SDK design challenge.
          </p>
          
          <div className="space-y-4">
            <Link href="/admin" className="block w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
              Admin Dashboard
            </Link>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-100 p-4 border-t mt-8">
        <div className="container mx-auto text-center text-gray-600">
          &copy; {new Date().getFullYear()} Composio. All rights reserved.
        </div>
      </footer>
    </div>
  );
}