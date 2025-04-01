/**
 * Utility functions for interacting with GitHub
 */

/**
 * Get the latest release information from GitHub
 */
export async function getLatestRelease() {
  const owner = process.env.GITHUB_REPO_OWNER || 'composio';
  const repo = process.env.GITHUB_REPO_NAME || 'sdk-design-question';
  const url = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${process.env.GH_PAT}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const release = await response.json();

    // Find the zip asset URL
    const zipAsset = release.assets.find((asset: any) => 
      asset.name.endsWith('.zip') && asset.name.includes('sdk-challenge')
    );

    return {
      tag_name: release.tag_name,
      name: release.name,
      download_url: release.html_url,
      created_at: release.created_at,
      zip_asset_url: zipAsset ? zipAsset.browser_download_url : null,
    };
  } catch (error) {
    console.error('Error fetching latest release:', error);
    throw error;
  }
}

/**
 * Create a new release with a zip file
 */
export async function createRelease(version: string, name: string, zipFilePath: string) {
  const owner = process.env.GITHUB_REPO_OWNER || 'composio';
  const repo = process.env.GITHUB_REPO_NAME || 'sdk-design-question';
  const url = `https://api.github.com/repos/${owner}/${repo}/releases`;

  try {
    // Create the release
    const createResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `token ${process.env.GH_PAT}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tag_name: version,
        name: name,
        draft: false,
        prerelease: false,
      }),
    });

    if (!createResponse.ok) {
      throw new Error(`GitHub API error: ${createResponse.statusText}`);
    }

    const release = await createResponse.json();

    // Upload the zip asset
    const uploadUrl = release.upload_url.replace(/{.*}/, '');
    
    // This part typically requires a full Node.js environment
    // For serverless functions, we'll need to handle file uploads differently
    // This is a placeholder for the actual implementation
    
    return {
      id: release.id,
      tag_name: release.tag_name,
      name: release.name,
      download_url: release.html_url,
      created_at: release.created_at,
    };
  } catch (error) {
    console.error('Error creating release:', error);
    throw error;
  }
}