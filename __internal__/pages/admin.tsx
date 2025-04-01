import { useState, useEffect, FormEvent } from "react";
import Head from "next/head";

// Types
type Candidate = {
  id: string;
  email: string;
  status: string;
  created_at: string;
  downloaded_at?: string | null;
  download_count: number;
};

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviteStatus, setInviteStatus] = useState<{
    success?: boolean;
    message: string;
  } | null>(null);

  // Fetch candidates on mount
  useEffect(() => {
    fetchCandidates();
  }, []);

  // Fetch candidates from API
  const fetchCandidates = async () => {
    try {
      const response = await fetch("/api/candidates");
      if (!response.ok) {
        throw new Error("Failed to fetch candidates");
      }

      const data = await response.json();
      setCandidates(data);
    } catch (error) {
      console.error("Error fetching candidates:", error);
    }
  };

  // Handle invite form submission
  const handleInvite = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setInviteStatus(null);

    try {
      const response = await fetch("/api/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setInviteStatus({
          success: true,
          message: `Successfully invited ${email}`,
        });
        setEmail("");
        fetchCandidates(); // Refresh candidate list
      } else {
        setInviteStatus({
          success: false,
          message: data.error || "Failed to invite candidate",
        });
      }
    } catch (error: any) {
      setInviteStatus({
        success: false,
        message: error.message || "An error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString();
  };

  // Get status badge color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "invited":
        return "bg-yellow-100 text-yellow-800";
      case "downloaded":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Head>
        <title>Composio SDK Challenge Admin</title>
        <meta
          name="description"
          content="Admin panel for Composio SDK Challenge"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-zinc-900 text-white py-4">
        <div className="max-w-screen-lg mx-auto px-4">
          <h1 className="text-lg font-medium">Composio SDK Challenge Admin</h1>
        </div>
      </header>

      <main className="flex-grow max-w-screen-lg mx-auto px-4 py-6">
        {/* Invite Form */}
        <div className="bg-white rounded-md shadow p-6 border border-zinc-200 mb-6">
          <h2 className="text-base font-medium text-zinc-900 mb-4">Invite New Candidate</h2>
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1">
                Candidate Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-600 text-sm"
                placeholder="candidate@example.com"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 text-sm font-medium ${
                  loading
                    ? "bg-zinc-300 text-zinc-500 cursor-not-allowed"
                    : "bg-zinc-900 text-white hover:bg-zinc-800 focus:ring-zinc-600"
                }`}
              >
                {loading ? "Sending..." : "Send Invitation"}
              </button>
            </div>
          </form>

          {/* Invite Status */}
          {inviteStatus && (
            <div
              className={`mt-4 p-3 rounded-md text-sm ${
                inviteStatus.success
                  ? "bg-green-50 border border-green-100 text-green-700"
                  : "bg-red-50 border border-red-100 text-red-700"
              }`}
            >
              {inviteStatus.message}
            </div>
          )}
        </div>

        {/* Candidates Table */}
        <div className="bg-white rounded-md shadow p-6 border border-zinc-200">
          <h2 className="text-base font-medium text-zinc-900 mb-4">Candidates</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider"
                  >
                    Invited
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider"
                  >
                    Downloaded
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider"
                  >
                    Count
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-zinc-200">
                {candidates.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-4 text-center text-zinc-500 text-sm"
                    >
                      No candidates found
                    </td>
                  </tr>
                ) : (
                  candidates.map((candidate) => (
                    <tr key={candidate.id} className="hover:bg-zinc-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-zinc-900">
                        {candidate.email}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-4 font-medium rounded-full ${
                            candidate.status === "invited"
                              ? "bg-yellow-50 text-yellow-700"
                              : candidate.status === "downloaded"
                              ? "bg-green-50 text-green-700"
                              : candidate.status === "completed"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-zinc-100 text-zinc-700"
                          }`}
                        >
                          {candidate.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-zinc-500">
                        {formatDate(candidate.created_at)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-zinc-500">
                        {formatDate(candidate.downloaded_at)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-zinc-500">
                        {candidate.download_count || 0}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
