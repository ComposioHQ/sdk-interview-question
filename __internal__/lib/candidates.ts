import { nanoid } from 'nanoid';
import { supabaseAdmin } from './supabase';
import { sendInvitationEmail } from './email';
import { Candidate } from '../types/database';

/**
 * Generate a unique token for a candidate
 */
export function generateCandidateToken(): string {
  return nanoid(12); // 12-character unique token
}

/**
 * Create a new candidate in the database
 */
export async function createCandidate(email: string): Promise<Candidate> {
  const token = generateCandidateToken();
  
  const { data, error } = await supabaseAdmin
    .from('candidates')
    .insert([
      {
        email,
        token,
        status: 'invited',
        created_at: new Date().toISOString(),
        download_count: 0,
      },
    ])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating candidate:', error);
    throw new Error(`Failed to create candidate: ${error.message}`);
  }
  
  return data as Candidate;
}

/**
 * Get a candidate by their token
 */
export async function getCandidateByToken(token: string): Promise<Candidate | null> {
  const { data, error } = await supabaseAdmin
    .from('candidates')
    .select('*')
    .eq('token', token)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') { // No rows returned
      return null;
    }
    
    console.error('Error fetching candidate:', error);
    throw new Error(`Failed to fetch candidate: ${error.message}`);
  }
  
  return data as Candidate;
}

/**
 * Get all candidates
 */
export async function getAllCandidates(): Promise<Candidate[]> {
  const { data, error } = await supabaseAdmin
    .from('candidates')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching candidates:', error);
    throw new Error(`Failed to fetch candidates: ${error.message}`);
  }
  
  return data as Candidate[];
}

/**
 * Update a candidate's status
 */
export async function updateCandidateStatus(
  candidateId: string, 
  status: Candidate['status'],
  additionalData: Partial<Candidate> = {}
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('candidates')
    .update({
      status,
      ...additionalData,
    })
    .eq('id', candidateId);
  
  if (error) {
    console.error('Error updating candidate:', error);
    throw new Error(`Failed to update candidate: ${error.message}`);
  }
}

/**
 * Mark a candidate as having downloaded the challenge
 */
export async function markCandidateDownloaded(candidateId: string): Promise<void> {
  try {
    // First, get the current candidate data
    const { data: candidate, error: fetchError } = await supabaseAdmin
      .from('candidates')
      .select('download_count')
      .eq('id', candidateId)
      .single();
    
    if (fetchError) {
      throw new Error(`Failed to fetch candidate data: ${fetchError.message}`);
    }
    
    // Calculate new download count
    const currentCount = candidate?.download_count || 0;
    const newCount = currentCount + 1;
    
    // Then update status, timestamp and increment download count
    const { error: updateError } = await supabaseAdmin
      .from('candidates')
      .update({
        status: 'downloaded',
        downloaded_at: new Date().toISOString(),
        download_count: newCount
      })
      .eq('id', candidateId);
    
    if (updateError) {
      throw new Error(`Failed to update candidate: ${updateError.message}`);
    }
  } catch (error: any) {
    console.error('Error marking candidate as downloaded:', error);
    throw new Error(`Failed to mark candidate as downloaded: ${error.message}`);
  }
}

/**
 * Invite a candidate by creating them in the database and sending an email
 */
export async function inviteCandidate(email: string): Promise<Candidate> {
  // Check if email is valid
  if (!email || !email.includes('@')) {
    throw new Error('Invalid email address');
  }
  
  try {
    // Create candidate in database
    const candidate = await createCandidate(email);
    
    // Send invitation email
    await sendInvitationEmail(email, candidate.token);
    
    return candidate;
  } catch (error) {
    console.error('Error inviting candidate:', error);
    throw error;
  }
}