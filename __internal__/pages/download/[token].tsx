import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

// Status types
type DownloadStatus = "loading" | "success" | "error";

export default function DownloadPage() {
  const router = useRouter();
  const { token } = router.query;

  const [status, setStatus] = useState<DownloadStatus>("loading");
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
          setStatus("error");
          setError(data.error || "Invalid download link");
          return;
        }

        if (!data.downloadUrl) {
          setStatus("error");
          setError("No download available at this time");
          return;
        }

        // Set download URL and success status
        setDownloadUrl(data.downloadUrl);
        setStatus("success");

        // Auto-download after a short delay
        setTimeout(() => {
          window.location.href = data.downloadUrl;
        }, 3000);
      } catch (error: any) {
        setStatus("error");
        setError(error.message || "An error occurred");
      }
    };

    validateToken();
  }, [token]);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center">
      <Head>
        <title>Composio SDK Challenge Download</title>
        <meta
          name="description"
          content="Download the Composio SDK Challenge"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-md shadow p-6 border border-zinc-200 text-center">
          {/* Loading State */}
          {status === "loading" && (
            <div className="py-8 text-center">
              <p className="text-zinc-600 text-sm">
                Validating your download link...
              </p>
            </div>
          )}

          {/* Error State */}
          {status === "error" && (
            <div className="py-6 text-center">
              <h2 className="text-base font-medium text-zinc-900">
                Download Failed
              </h2>
              <p className="mt-2 text-zinc-600 text-sm">
                {error || "Something went wrong"}
              </p>
            </div>
          )}

          {/* Success State */}
          {status === "success" && downloadUrl && (
            <div className="py-6 text-center">
              <h2 className="text-base font-medium text-zinc-900">
                Download Ready
              </h2>
              <p className="mt-2 text-zinc-600 text-sm mb-6">
                Your download will start automatically in a few seconds
              </p>

              <a
                href={downloadUrl}
                className="block w-full py-2 px-3 text-center text-sm font-medium text-white bg-zinc-900 rounded-md hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900"
              >
                Download Now
              </a>

              <div className="mt-6 p-4 bg-zinc-50 rounded-md border border-zinc-200 text-sm">
                <h3 className="font-medium text-zinc-900 mb-2">Next Steps:</h3>
                <ol className="list-decimal list-inside text-zinc-600 space-y-1.5">
                  <li>Extract the ZIP file to your preferred location</li>
                  <li>Follow the setup instructions in the README file</li>
                  <li>Complete the challenge as described</li>
                  <li>Submit your solution as instructed</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
