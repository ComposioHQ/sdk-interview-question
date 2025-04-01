# SDK Challenge Admin

This is an internal tool for managing the SDK design challenge distribution to candidates.

## Features

- Send invitation emails to candidates with unique download links
- Track candidate progress (invited, downloaded)
- Automatically create GitHub releases with zipped repo on push to master/main
- Admin dashboard to manage candidates

## Technologies Used

- Next.js for the frontend and API routes
- Supabase for database and authentication
- Resend for email delivery
- GitHub Actions for release automation
- Vercel for deployment

## Setup and Testing Guide

This guide will walk you through the complete setup and testing process.

### Prerequisites

- Bun runtime (recommended) or Node.js 18+
- GitHub repository with the SDK challenge code
- Supabase account
- Resend account
- Vercel account (optional, for deployment)

### Step 1: Initial Setup

1. Install dependencies:

```bash
cd __internal__
bun install
```

2. Copy the `.env.example` file to `.env.local`:

```bash
cp .env.example .env.local
```

3. Edit `.env.local` with your configuration values:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Resend Email Service
RESEND_API_KEY=re_your_resend_api_key

# Application Settings
NEXT_PUBLIC_BASE_URL=http://localhost:3000
GH_PAT=github_pat_your_token
GITHUB_REPO_OWNER=your-github-username
GITHUB_REPO_NAME=sdk-design-question

# For GitHub webhook
GITHUB_WEBHOOK_SECRET=your-webhook-secret
```

### Step 2: Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. In your Supabase project, go to the SQL Editor
3. Copy the contents of the `schema.sql` file
4. Paste and run the SQL script
5. Obtain your Supabase URL and API keys from Project Settings > API 
6. Add these to your `.env.local` file

### Step 3: Set Up Resend for Email

1. Create an account at [resend.com](https://resend.com)
2. Verify your domain or use the default Resend domain for testing
3. Generate an API key and add it to your `.env.local` file

### Step 4: Configure GitHub

1. Generate a GitHub Personal Access Token with `repo` scope 
2. Add the token to your `.env.local` file as `GH_PAT`

### Step 5: Start the Development Server

```bash
bun dev
```

Your server should now be running at http://localhost:3000

### Step 6: Testing the System

#### Test Admin Interface

1. Open http://localhost:3000/admin in your browser
2. You should see the admin dashboard with a form to invite candidates
3. Enter a test email and click "Send Invitation"
4. You should see the candidate appear in the candidates list

#### Test CLI

Test the invitation functionality:

```bash
bun invite test@example.com
```

List all candidates:

```bash
bun list
```

#### Test the Download Flow

1. After inviting a test candidate, you'll get a download link
2. Open that link in your browser
3. You'll see an error initially because no release exists yet

#### Test GitHub Release Creation

To test the complete flow with GitHub releases:

1. Push your changes to the GitHub repository
2. The GitHub Action will create a release with a zipped version of the repo
3. This release will be available for candidates to download

If you want to test locally without pushing:

1. Create a test release in your GitHub repository manually
2. Add a ZIP file as an asset to the release
3. The download link should now work

### Step 7: Vercel Deployment (Optional)

1. Push your code to GitHub
2. Import the project in Vercel
3. Configure the environment variables
4. Deploy!

### Step 8: Troubleshooting

#### Email Delivery Issues

- Check Resend dashboard for delivery status and errors
- Ensure your email format is correct
- If using a custom domain, verify it's properly configured in Resend

#### Database Connection Issues

- Verify Supabase credentials are correct
- Check network connectivity to Supabase
- Ensure tables were created correctly using the Supabase Table Editor

#### GitHub Release Issues

- Verify your GitHub token has sufficient permissions
- Check GitHub Actions logs for any errors in the release process
- Manually create a test release to verify download functionality

#### CLI Command Issues

- Make sure `cli.ts` has execute permissions: `chmod +x cli.ts`
- Verify environment variables are loaded correctly
- Try running with explicit environment file: `bun -e .env.local cli.ts list`

#### Next.js Application Issues

- Check browser console for any JavaScript errors
- Verify API routes using browser dev tools or tools like Postman
- Try clearing browser cache or using incognito mode for testing

### Database Schema Details

The schema migration script (`schema.sql`) creates:

1. A `candidates` table for tracking candidate invitations and downloads
2. A `releases` table for storing GitHub releases
3. Necessary indexes for better performance
4. A utility function for incrementing download counts

You can run it directly from the CLI with the Supabase CLI:

```bash
cat schema.sql | supabase sql --db-url postgresql://postgres:postgres@localhost:54322/postgres
```

### Additional GitHub Configuration

For production deployments, you should also:

1. Set up a webhook in your repository settings that points to your deployed `/api/github-webhook` endpoint
2. Configure the webhook secret in your environment variables
3. Set the webhook to trigger on release events

## Usage

### Inviting Candidates

#### Via Web UI
1. Navigate to the `/admin` page
2. Enter the candidate's email address
3. Click "Send Invitation"

#### Via CLI (TypeScript)
```bash
# Invite a candidate by email
bun invite john.doe@example.com

# List all candidates
bun list

# Directly run the CLI
bun cli.ts invite john.doe@example.com
bun cli.ts list
```

### Tracking Progress

The admin dashboard shows all candidates and their current status.

### Automatic Releases

Whenever you push to the `master` or `main` branch, a GitHub action will:

1. Create a clean zip of the repository (excluding internal files)
2. Create a new GitHub release with this zip file
3. Update the Supabase database with the release information

## Customization

- Edit email templates in `lib/email.ts`
- Modify the UI in the `pages` directory
- Adjust the GitHub Action workflow in `.github/workflows/release.yml`