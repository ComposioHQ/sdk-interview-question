import { NextApiRequest, NextApiResponse } from 'next';
import { getAllCandidates } from '../../lib/candidates';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const candidates = await getAllCandidates();
    
    // Return limited information for security
    const sanitizedCandidates = candidates.map(candidate => ({
      id: candidate.id,
      email: candidate.email,
      status: candidate.status,
      created_at: candidate.created_at,
      downloaded_at: candidate.downloaded_at,
      download_count: candidate.download_count,
    }));
    
    return res.status(200).json(sanitizedCandidates);
  } catch (error: any) {
    console.error('Error in candidates API:', error);
    
    return res.status(500).json({
      error: error.message || 'Failed to fetch candidates',
    });
  }
}