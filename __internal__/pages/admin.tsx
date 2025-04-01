import { useState, useEffect, FormEvent } from 'react';
import Head from 'next/head';

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
  const [email, setEmail] = useState('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviteStatus, setInviteStatus] = useState<{ success?: boolean; message: string } | null>(null);
  
  // Fetch candidates on mount
  useEffect(() => {
    fetchCandidates();
  }, []);
  
  // Fetch candidates from API
  const fetchCandidates = async () => {
    try {
      const response = await fetch('/api/candidates');
      if (!response.ok) {
        throw new Error('Failed to fetch candidates');
      }
      
      const data = await response.json();
      setCandidates(data);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    }
  };
  
  // Handle invite form submission
  const handleInvite = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setInviteStatus(null);
    
    try {
      const response = await fetch('/api/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setInviteStatus({
          success: true,
          message: `Successfully invited ${email}`,
        });
        setEmail('');
        fetchCandidates(); // Refresh candidate list
      } else {
        setInviteStatus({
          success: false,
          message: data.error || 'Failed to invite candidate',
        });
      }
    } catch (error: any) {
      setInviteStatus({
        success: false,
        message: error.message || 'An error occurred',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString();
  };
  
  // Get status badge color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'invited':
        return 'bg-yellow-100 text-yellow-800';
      case 'downloaded':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Composio SDK Challenge Admin</title>
        <meta name="description" content="Admin panel for Composio SDK Challenge" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <header className="bg-blue-600 text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Composio SDK Challenge Admin</h1>
        </div>
      </header>
      
      <main className="container mx-auto p-4">
        {/* Invite Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Invite New Candidate</h2>
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-gray-700 mb-2">
                Candidate Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="candidate@example.com"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {loading ? 'Sending...' : 'Send Invitation'}
              </button>
            </div>
          </form>
          
          {/* Invite Status */}
          {inviteStatus && (
            <div
              className={`mt-4 p-4 rounded-md ${
                inviteStatus.success
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              {inviteStatus.message}
            </div>
          )}
        </div>
        
        {/* Candidates Table */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Candidates</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invited
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Downloaded
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Count
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {candidates.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No candidates found
                    </td>
                  </tr>
                ) : (
                  candidates.map((candidate) => (
                    <tr key={candidate.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {candidate.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(candidate.status)}`}>
                          {candidate.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(candidate.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(candidate.downloaded_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
      
      <footer className="bg-gray-100 p-4 border-t mt-8">
        <div className="container mx-auto text-center text-gray-600">
          &copy; {new Date().getFullYear()} Composio. All rights reserved.
        </div>
      </footer>
    </div>
  );
}