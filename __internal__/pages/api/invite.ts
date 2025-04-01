import { NextApiRequest, NextApiResponse } from 'next';
import { inviteCandidate } from '../../lib/candidates';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { email } = req.body;
    
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const candidate = await inviteCandidate(email);
    
    return res.status(200).json({
      success: true,
      candidate: {
        id: candidate.id,
        email: candidate.email,
        token: candidate.token,
      },
    });
  } catch (error: any) {
    console.error('Error in invite API:', error);
    
    return res.status(500).json({
      error: error.message || 'Failed to invite candidate',
    });
  }
}