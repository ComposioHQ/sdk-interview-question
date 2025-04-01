import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../lib/supabase';
import crypto from 'crypto';

// Verify GitHub webhook signature
function verifyGitHubWebhook(req: NextApiRequest): boolean {
  const signature = req.headers['x-hub-signature-256'] as string;
  
  if (!signature || !process.env.GITHUB_WEBHOOK_SECRET) {
    return false;
  }
  
  const hmac = crypto.createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET);
  const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Verify webhook signature for security
    if (!verifyGitHubWebhook(req)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    const { action, release } = req.body;
    
    if (action === 'published' && release) {
      // Find the zip asset
      const zipAsset = release.assets.find((asset: any) => 
        asset.name.endsWith('.zip') && asset.name.includes('sdk-challenge')
      );
      
      // Store the new release information
      await supabaseAdmin
        .from('releases')
        .insert([
          {
            tag_name: release.tag_name,
            name: release.name,
            download_url: release.html_url,
            created_at: release.created_at,
            zip_asset_url: zipAsset ? zipAsset.browser_download_url : null,
          },
        ]);
      
      console.log(`Stored new release: ${release.tag_name}`);
      
      return res.status(200).json({
        success: true,
        message: `Release ${release.tag_name} stored successfully`,
      });
    }
    
    // For other webhook events
    return res.status(200).json({
      success: true,
      message: 'Webhook received but no action taken',
    });
  } catch (error: any) {
    console.error('Error in GitHub webhook API:', error);
    
    return res.status(500).json({
      error: error.message || 'Failed to process webhook',
    });
  }
}