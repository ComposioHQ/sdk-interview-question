#!/usr/bin/env bun

import { createClient } from "@supabase/supabase-js";
import { nanoid } from "nanoid";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { type Database } from "./types/supabase";
import { type Candidate } from "./types/database";
import { sendInvitationEmail } from "./lib/email";

// Load environment variables from .env file if present
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Use the Candidate type from database.ts

/**
 * Generate a unique token for a candidate
 */
function generateCandidateToken(): string {
  return nanoid(12); // 12-character unique token
}

/**
 * Create a candidate in the database
 */
async function createCandidate(email: string): Promise<Candidate> {
  const token = generateCandidateToken();

  const { data, error } = await supabase
    .from("candidates")
    .insert([
      {
        email,
        token,
        status: "invited",
        created_at: new Date().toISOString(),
        download_count: 0,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create candidate: ${error.message}`);
  }

  return data as Candidate;
}

/**
 * Invite a candidate by creating them in the database and sending an email
 */
async function inviteCandidate(email: string): Promise<Candidate> {
  // Create candidate in database
  console.log(`Creating candidate record for ${email}...`);
  const candidate = await createCandidate(email);

  // Send invitation email
  console.log(`Sending invitation email to ${email}...`);
  await sendInvitationEmail(email, candidate.token);

  return candidate;
}

/**
 * List all candidates
 */
async function listCandidates(): Promise<Candidate[]> {
  const { data, error } = await supabase
    .from("candidates")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch candidates: ${error.message}`);
  }

  return data as Candidate[];
}

// Main CLI function
async function main() {
  const command = process.argv[2];

  if (!command) {
    console.log(`
SDK Challenge CLI

Available commands:
  invite <email>  - Invite a candidate by email
  list            - List all candidates
  help            - Show this help message
    `);
    return;
  }

  try {
    switch (command) {
      case "invite": {
        const email = process.argv[3];

        if (!email || !email.includes("@")) {
          console.error("Please provide a valid email address.");
          break;
        }

        console.log(`Inviting candidate: ${email}`);
        const candidate = await inviteCandidate(email);
        console.log(
          `Successfully invited ${email} with token: ${candidate.token}`
        );
        console.log(
          `Download link: ${process.env.NEXT_PUBLIC_BASE_URL}/download/${candidate.token}`
        );
        break;
      }

      case "list": {
        console.log("Fetching candidates...");
        const candidates = await listCandidates();

        console.log("\nCandidates:");
        console.log("===========");

        if (candidates.length === 0) {
          console.log("No candidates found.");
        } else {
          candidates.forEach((c, i) => {
            console.log(`${i + 1}. ${c.email} (${c.status})`);
            console.log(
              `   Invited: ${new Date(c.created_at).toLocaleString()}`
            );
            console.log(`   Downloads: ${c.download_count || 0}`);
            if (c.downloaded_at) {
              console.log(
                `   Last download: ${new Date(
                  c.downloaded_at
                ).toLocaleString()}`
              );
            }
            console.log(`   Token: ${c.token}`);
            console.log();
          });
        }
        break;
      }

      case "help":
      default:
        console.log(`
SDK Challenge CLI

Available commands:
  invite <email>  - Invite a candidate by email
  list            - List all candidates
  help            - Show this help message
        `);
        break;
    }
  } catch (error: any) {
    console.error("Error:", error.message);
  }
}

// Execute main function
void main();
