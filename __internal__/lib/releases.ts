import { supabaseAdmin } from './supabase';
import { getLatestRelease } from './github';
import { Release } from '../types/database';

/**
 * Get the latest release from the database
 */
export async function getLatestReleaseFromDB(): Promise<Release | null> {
  const { data, error } = await supabaseAdmin
    .from('releases')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') { // No rows returned
      return null;
    }
    
    console.error('Error fetching latest release:', error);
    throw new Error(`Failed to fetch latest release: ${error.message}`);
  }
  
  return data as Release;
}

/**
 * Sync the latest release from GitHub to the database
 */
export async function syncLatestRelease(): Promise<Release> {
  try {
    // Fetch the latest release from GitHub
    const githubRelease = await getLatestRelease();
    
    // Check if this release already exists in the database
    const { data: existingRelease, error: fetchError } = await supabaseAdmin
      .from('releases')
      .select('*')
      .eq('tag_name', githubRelease.tag_name)
      .single();
    
    if (!fetchError && existingRelease) {
      // Release already exists, return it
      return existingRelease as Release;
    }
    
    // Insert the new release into the database
    const { data, error } = await supabaseAdmin
      .from('releases')
      .insert([
        {
          tag_name: githubRelease.tag_name,
          name: githubRelease.name,
          download_url: githubRelease.download_url,
          created_at: githubRelease.created_at,
          zip_asset_url: githubRelease.zip_asset_url,
        },
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Error storing release:', error);
      throw new Error(`Failed to store release: ${error.message}`);
    }
    
    return data as Release;
  } catch (error) {
    console.error('Error syncing latest release:', error);
    throw error;
  }
}

/**
 * Get all releases from the database
 */
export async function getAllReleases(): Promise<Release[]> {
  const { data, error } = await supabaseAdmin
    .from('releases')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching releases:', error);
    throw new Error(`Failed to fetch releases: ${error.message}`);
  }
  
  return data as Release[];
}

/**
 * Get the latest release with fallback to GitHub sync
 */
export async function getLatestReleaseWithFallback(): Promise<Release> {
  try {
    // Try to get from DB first
    const dbRelease = await getLatestReleaseFromDB();
    
    if (dbRelease) {
      return dbRelease;
    }
    
    // If not in DB, sync from GitHub
    return await syncLatestRelease();
  } catch (error) {
    console.error('Error getting latest release with fallback:', error);
    throw error;
  }
}