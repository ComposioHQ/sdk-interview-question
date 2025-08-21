import { marked } from 'marked';

export interface Env {
  DEPLOYMENTS: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers for all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      switch (path) {
        case '/upload-new':
          return handleUploadNew(request, env, corsHeaders);
        
        case '/':
        case '/readme':
          return handleReadme(request, env, corsHeaders);
        
        case '/zip':
          return handleZip(request, env, corsHeaders);
        
        case '/docs/stateMachine.png':
          return handleImage(request, env, corsHeaders);
        
        default:
          return new Response(
            JSON.stringify({ 
              error: 'Not found',
              availableRoutes: ['/', '/readme', '/zip', '/upload-new']
            }), 
            { 
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
      }
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  },
};

async function handleUploadNew(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders 
    });
  }

  try {
    const { url } = await request.json() as { url: string };
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Store the new deployment URL in KV
    await env.DEPLOYMENTS.put('latest_url', url);
    await env.DEPLOYMENTS.put(`deployment_${Date.now()}`, url);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Deployment URL updated',
        url 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body' }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

async function handleReadme(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
  try {
    // Get the latest deployment URL
    const latestUrl = await env.DEPLOYMENTS.get('latest_url');
    
    // Use the actual README content from the repository
    const readmeContent = `# sdk-design-question

To install dependencies:

\`\`\`bash
curl -fsSL https://bun.sh/install | bash
bun install
\`\`\`

To run:

\`\`\`bash
bun run src/index.ts
\`\`\`

## task

i want you to design a "better" state machine library, ideally i want it to use \`discriminated unions\`, and a clean simple zustand like \`api\`

**State Machine Diagram:**
![example state machine](https://utfs.io/f/f7900d2a-1e91-4106-8f40-0b0317df08bc-w03t4m.png)

it should be type safe, it should have state, transitions and action definitions. this means i want these **"CONTRACTS" explicitly defined** in the type system

the seeded code is in \`src/\` from \`zustand\` feel free to throw it out if you'd prefer, but would use it as a start on how to build this type of tool - you can choose another api if find that better

it should be usable like this
\`\`\`tsx
const useWebsocketStore = () => {
  // YOUR SDK used here

  // define state.kind (types of the state of the state machine explicitly)
  // define state transitions explicitly (which states can go to which other states)
  // define actions how the state has a transition to another state explicitly
  // these are the contracts of the state machine

  return { state, actions };
};

const App = () => {
  const { state, actions } = useWebsocketStore();

  switch (state.kind) {
    case "idle": {
      return <button onClick={() => actions.connect(state)}>Connect</button>;
    }
    case "connecting": {
      return <p>Connecting...</p>;
    }
    case "connected": {
      return (
        <button onClick={() => actions.disconnect(state)}>Disconnect</button>
      );
    }
    case "error": {
      return <p>Something went wrong: {state.errorMessage}</p>;
    }
  }
};
\`\`\`

use \`test/sdk.tsx\` to design the api

to submit, reply to the email you got with the zipped folder after an hr (max 75 mins) after you start

### references

1. [zustand](https://github.com/pmndrs/zustand), also have an \`example_zustand.tsx\` file inside docs you can look at
   \`\`\`ts
   // Basic Zustand example
   import { create } from 'zustand'

   // Define your store
   const useStore = create((set) => ({
     // State
     count: 0,
     
     // Actions
     increment: () => set((state) => ({ count: state.count + 1 })),
     decrement: () => set((state) => ({ count: state.count - 1 })),
     reset: () => set({ count: 0 }),
   }))

   // Use in a component
   function Counter() {
     const { count, increment, decrement, reset } = useStore()
     
     return (
       <div>
         <h1>{count}</h1>
         <button onClick={increment}>Increment</button>
         <button onClick={decrement}>Decrement</button>
         <button onClick={reset}>Reset</button>
       </div>
     )
   }
   \`\`\`
2. [discriminated unions](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions)
  \`\`\`ts
  // Basic TypeScript discriminated union example
  type NetworkState =
    | { status: 'disconnected' }
    | { status: 'connecting' }
    | { status: 'connected' }
    | { status: 'error'; errorMessage: string };

  // Using the discriminated union
  function handleNetworkState(state: NetworkState) {
    // The 'status' property acts as the discriminant
    switch (state.status) {
      case 'disconnected':
        return 'Ready to connect';
      case 'connecting':
        return 'Establishing connection...';
      case 'connected':
        return 'Connection established';
      case 'error':
        // TypeScript knows 'errorMessage' exists only in this case
        return \`Error: \${state.errorMessage}\`;
    }
  }
  \`\`\`
`;

    const htmlContent = marked(readmeContent);

    const html = `<!DOCTYPE html>
    <html>
    <head>
      <title>SDK Design Question</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          max-width: 900px; 
          margin: 0 auto; 
          padding: 20px; 
          line-height: 1.6;
          color: #333;
          background: #fafafa;
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        h1, h2, h3, h4, h5, h6 { color: #2c3e50; margin-top: 2em; margin-bottom: 0.5em; }
        h1 { font-size: 2.5em; margin-top: 0; }
        code { 
          background: #f8f9fa; 
          padding: 2px 8px; 
          border-radius: 4px; 
          font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
          font-size: 0.9em;
          color: #e83e8c;
        }
        pre { 
          background: #f8f9fa; 
          padding: 20px; 
          border-radius: 8px; 
          overflow-x: auto;
          border: 1px solid #e9ecef;
          margin: 1.5em 0;
        }
        pre code {
          background: none;
          padding: 0;
          color: #333;
          font-size: 0.85em;
        }
        blockquote {
          border-left: 4px solid #007acc;
          margin: 1.5em 0;
          padding-left: 20px;
          color: #666;
        }
        img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
        }
        .header {
          text-align: center;
          padding: 30px 0;
          border-bottom: 2px solid #007acc;
          margin-bottom: 40px;
        }
        .download-btn {
          display: inline-block;
          background: #007acc;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 0 10px;
          transition: background 0.2s;
        }
        .download-btn:hover {
          background: #0056b3;
          color: white;
        }
        .download-btn.secondary {
          background: #6c757d;
        }
        .download-btn.secondary:hover {
          background: #545b62;
        }
        .footer {
          text-align: center;
          padding: 30px 0;
          border-top: 1px solid #eee;
          margin-top: 60px;
          color: #666;
          font-size: 0.9em;
        }
        .deployment-info {
          background: #e7f3ff;
          padding: 15px;
          border-radius: 6px;
          border-left: 4px solid #007acc;
          margin: 20px 0;
        }
        ul li, ol li {
          margin: 0.5em 0;
        }
        a {
          color: #007acc;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📦 SDK Design Question</h1>
          <p style="font-size: 1.1em; color: #666;">TypeScript SDK for State Management</p>
          
          <div style="margin: 20px 0;">
            <a href="/zip" class="download-btn">📥 Download ZIP</a>
            ${latestUrl ? `<a href="${latestUrl}" target="_blank" class="download-btn secondary">🚀 View Live</a>` : ''}
          </div>
        </div>
        
        ${latestUrl ? `
        <div class="deployment-info">
          <strong>🔗 Latest Deployment:</strong> <a href="${latestUrl}" target="_blank">${latestUrl}</a>
        </div>
        ` : ''}
        
        ${htmlContent}
        
        <div class="footer">
          <p><strong>🔧 Worker Dashboard</strong> • Last updated: ${new Date().toLocaleString()}</p>
          <p><a href="/zip">Download ZIP</a> • <a href="https://github.com/anthropics/claude-code">Built with Claude Code</a></p>
        </div>
      </div>
    </body>
    </html>`;

    return new Response(html, {
      headers: { ...corsHeaders, 'Content-Type': 'text/html' }
    });
  } catch (error) {
    return new Response(
      `<!DOCTYPE html>
      <html>
      <head>
        <title>SDK Design Question</title>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #fafafa; }
          .container { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .error { background: #fee; border: 1px solid #fcc; padding: 20px; border-radius: 8px; color: #c00; }
          .download-btn { display: inline-block; background: #007acc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="error">
            <h2>📦 SDK Design Question</h2>
            <p>Welcome to the SDK Design Question worker!</p>
            <a href="/zip" class="download-btn">📥 Download ZIP</a>
          </div>
        </div>
      </body>
      </html>`,
      { 
        headers: { ...corsHeaders, 'Content-Type': 'text/html' }
      }
    );
  }
}

async function handleZip(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
  try {
    // Get the latest deployment URL
    const latestUrl = await env.DEPLOYMENTS.get('latest_url');
    
    if (!latestUrl) {
      return new Response(
        JSON.stringify({ error: 'No deployment found. Please run the deploy script first.' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // The deployment URL IS the zip file, so redirect to it
    return Response.redirect(latestUrl, 302);
    
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: 'Could not fetch ZIP file from deployment',
        details: 'The ZIP file might not be available at the deployment URL'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

async function handleImage(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
  // Return the state machine diagram image as base64 data URL
  // This is a placeholder - you'd need to get the actual image data
  const imagePlaceholder = `<!DOCTYPE html>
  <html>
  <head>
    <title>State Machine Diagram</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 50px auto; text-align: center; }
      .placeholder { background: #f0f0f0; border: 2px dashed #ccc; padding: 60px 20px; border-radius: 8px; }
    </style>
  </head>
  <body>
    <div class="placeholder">
      <h2>📊 State Machine Diagram</h2>
      <p>The state machine diagram would be displayed here.</p>
      <p>Download the ZIP file to see the actual image.</p>
    </div>
  </body>
  </html>`;

  return new Response(imagePlaceholder, {
    headers: { ...corsHeaders, 'Content-Type': 'text/html' }
  });
}