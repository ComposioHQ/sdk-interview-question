import { NextApiRequest, NextApiResponse } from 'next';
import { getCandidateByToken, markCandidateDownloaded } from '../../../lib/candidates';
import { getLatestReleaseWithFallback } from '../../../lib/releases';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { token } = req.query;
    
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'Token is required' });
    }
    
    // Get the candidate
    const candidate = await getCandidateByToken(token);
    
    if (!candidate) {
      return res.status(404).json({ 
        valid: false,
        error: 'Invalid token' 
      });
    }
    
    // Get the latest release
    const release = await getLatestReleaseWithFallback();
    
    if (!release || !release.zip_asset_url) {
      return res.status(404).json({ 
        valid: true,
        error: 'No release available for download' 
      });
    }
    
    // Mark the candidate as having downloaded the challenge
    await markCandidateDownloaded(candidate.id);
    
    return res.status(200).json({
      valid: true,
      downloadUrl: release.zip_asset_url,
      candidate: {
        email: candidate.email,
        status: 'downloaded'
      }
    });
  } catch (error: any) {
    console.error('Error in download API:', error);
    
    return res.status(500).json({
      error: error.message || 'Failed to process download request',
    });
  }
}