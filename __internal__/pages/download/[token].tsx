import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

// Status types
type DownloadStatus = 'loading' | 'success' | 'error';

export default function DownloadPage() {
  const router = useRouter();
  const { token } = router.query;
  
  const [status, setStatus] = useState<DownloadStatus>('loading');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Wait until the token is available from the router
    if (!token) return;
    
    const validateToken = async () => {
      try {
        const response = await fetch(`/api/download/${token}`);
        const data = await response.json();
        
        if (!response.ok || !data.valid) {
          setStatus('error');
          setError(data.error || 'Invalid download link');
          return;
        }
        
        if (!data.downloadUrl) {
          setStatus('error');
          setError('No download available at this time');
          return;
        }
        
        // Set download URL and success status
        setDownloadUrl(data.downloadUrl);
        setStatus('success');
        
        // Auto-download after a short delay
        setTimeout(() => {
          window.location.href = data.downloadUrl;
        }, 3000);
      } catch (error: any) {
        setStatus('error');
        setError(error.message || 'An error occurred');
      }
    };
    
    validateToken();
  }, [token]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Composio SDK Challenge Download</title>
        <meta name="description" content="Download the Composio SDK Challenge" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <header className="bg-blue-600 text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Composio SDK Challenge</h1>
        </div>
      </header>
      
      <main className="container mx-auto p-4 flex items-center justify-center min-h-[70vh]">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          {/* Loading State */}
          {status === 'loading' && (
            <div className="text-center py-8">
              <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="mt-4 text-gray-600">Validating your download token...</p>
            </div>
          )}
          
          {/* Error State */}
          {status === 'error' && (
            <div className="py-8 text-center">
              <svg className="h-16 w-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 className="text-xl font-bold text-red-600 mt-4">Download Failed</h2>
              <p className="mt-2 text-gray-600">{error || 'Something went wrong'}</p>
            </div>
          )}
          
          {/* Success State */}
          {status === 'success' && downloadUrl && (
            <div className="py-8 text-center">
              <svg className="h-16 w-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-xl font-bold text-green-600 mt-4">Download Ready</h2>
              <p className="mt-2 text-gray-600">Your SDK challenge repository is ready for download.</p>
              <p className="text-sm text-gray-500 mt-1 mb-4">The download will start automatically in a few seconds.</p>
              
              <a
                href={downloadUrl}
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Download Now
              </a>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-md text-left">
                <h3 className="font-medium text-gray-900 mb-2">Next Steps:</h3>
                <ol className="list-decimal list-inside text-gray-600 space-y-1">
                  <li>Extract the ZIP file to your preferred location</li>
                  <li>Follow the setup instructions in the README.md file</li>
                  <li>Complete the challenge as described</li>
                  <li>Submit your solution as instructed in the README</li>
                </ol>
              </div>
            </div>
          )}
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