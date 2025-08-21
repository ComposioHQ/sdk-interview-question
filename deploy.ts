#!/usr/bin/env bun
import { $ } from "bun";
import { existsSync, rmSync } from "fs";

const DEPLOY_ZIP = 'sdk-design-question.zip';

async function createZip(): Promise<boolean> {
  console.log('Creating zip file...');
  
  // Remove existing zip if it exists
  if (existsSync(DEPLOY_ZIP)) {
    rmSync(DEPLOY_ZIP);
    console.log('Removed existing zip file');
  }
  
  try {
    // Create zip excluding __internal__ folder
    await $`zip -r ${DEPLOY_ZIP} . -x "__internal__/*" "node_modules/*" ".git/*" "${DEPLOY_ZIP}"`;
    console.log('✅ Zip file created successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to create zip file:', error);
    return false;
  }
}

async function deployToUptCli(): Promise<string | null> {
  console.log('Deploying to upt-cli...');
  
  try {
    const output = await $`bunx upt-cli ${DEPLOY_ZIP}`.text();
    
    console.log('✅ Deployment successful');
    console.log('Output:', output);
    
    // Extract URL from output (upt-cli typically returns a URL)
    const urlMatch = output.match(/(https?:\/\/[^\s]+)/);
    const deployUrl = urlMatch ? urlMatch[1] : null;
    
    if (deployUrl) {
      console.log('🚀 Deployed at:', deployUrl);
      
      // Update the worker's KV with the new URL
      await updateWorkerKV(deployUrl);
    }
    
    return deployUrl;
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    return null;
  }
}

async function updateWorkerKV(url: string): Promise<void> {
  console.log('Updating worker KV with new deployment URL...');
  
  try {
    // Call the worker's upload-new endpoint to update the KV
    const response = await fetch('https://sdk-design-question-worker.sohamganatra1.workers.dev/upload-new', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url })
    });
    
    if (response.ok) {
      console.log('✅ Worker KV updated successfully');
    } else {
      console.log('⚠️  Worker KV update failed, but deployment succeeded');
    }
  } catch (error) {
    console.log('⚠️  Could not update worker KV:', error);
  }
}

async function deployWorker(): Promise<void> {
  console.log('Deploying Cloudflare Worker...');
  
  try {
    await $`bun run deploy:worker`.cwd('__internal__');
    console.log('✅ Worker deployed successfully');
  } catch (error) {
    console.error('❌ Worker deployment failed:', error);
  }
}

async function deploy(): Promise<void> {
  console.log('🚀 Starting deployment process...');
  
  // Step 1: Deploy the worker first
  await deployWorker();
  
  // Step 2: Create zip file
  const zipCreated = await createZip();
  if (!zipCreated) {
    process.exit(1);
  }
  
  // Step 3: Deploy to upt-cli
  const deployUrl = await deployToUptCli();
  
  if (deployUrl) {
    console.log('🎉 Deployment completed successfully!');
    console.log('📦 Main deployment:', deployUrl);
    console.log('🔧 Worker dashboard: https://sdk-design-question-worker.sohamganatra1.workers.dev/');
  } else {
    console.log('❌ Deployment failed');
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.main) {
  await deploy();
}

export { deploy };