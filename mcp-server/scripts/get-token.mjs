#!/usr/bin/env node
/**
 * get-token.mjs — Get a Google ID token for testing the MCP server.
 *
 * Usage:
 *   node scripts/get-token.mjs
 *
 * Requires in .env:
 *   GOOGLE_CLIENT_ID=...
 *   GOOGLE_CLIENT_SECRET=...   ← add this from Google Cloud Console
 *
 * The script:
 *   1. Spins up a local callback server on :3002
 *   2. Opens Google's consent page in your browser
 *   3. Catches the auth code, exchanges it for tokens
 *   4. Prints the ID token (copy into GOOGLE_ID_TOKEN env var)
 */

import http from 'http';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

// Load .env manually (no dotenv needed)
const __dir = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dir, '../.env');
const env = {};
try {
  readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && !k.startsWith('#')) env[k.trim()] = v.join('=').trim();
  });
} catch {
  console.error('Could not read .env — make sure it exists in mcp-server/');
  process.exit(1);
}

const CLIENT_ID = env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3002/callback';

if (!CLIENT_ID) {
  console.error('Missing GOOGLE_CLIENT_ID in .env');
  process.exit(1);
}
if (!CLIENT_SECRET) {
  console.error(
    'Missing GOOGLE_CLIENT_SECRET in .env\n' +
    'Go to: https://console.cloud.google.com/apis/credentials\n' +
    'Click your OAuth 2.0 Client → copy the secret → add to .env as GOOGLE_CLIENT_SECRET=...\n' +
    '\nAlso ensure http://localhost:3002/callback is in "Authorized redirect URIs" for the credential.'
  );
  process.exit(1);
}

// Build the Google OAuth2 authorize URL
const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
authUrl.searchParams.set('client_id', CLIENT_ID);
authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('scope', 'openid email profile');
authUrl.searchParams.set('access_type', 'offline');
authUrl.searchParams.set('prompt', 'select_account');

console.log('\nOpening browser for Google sign-in...');
console.log('If it does not open automatically, visit:\n' + authUrl.toString() + '\n');

// Open browser
const open = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
exec(`${open} "${authUrl.toString()}"`);

// Local callback server
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost:3002');
  if (url.pathname !== '/callback') { res.end(); return; }

  const code = url.searchParams.get('code');
  if (!code) {
    res.writeHead(400); res.end('No code in callback');
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('<h2>✅ Got it! You can close this tab.</h2>');
  server.close();

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });

  const tokens = await tokenRes.json();

  if (!tokens.id_token) {
    console.error('\nFailed to get id_token:', JSON.stringify(tokens, null, 2));
    process.exit(1);
  }

  console.log('\n✅ ID Token (valid ~1 hour):\n');
  console.log(tokens.id_token);
  console.log('\nRun this to use it:\n');
  console.log(`export GOOGLE_ID_TOKEN="${tokens.id_token}"\n`);
});

server.listen(3002, '127.0.0.1', () => {
  console.log('Waiting for Google callback on http://localhost:3002/callback ...');
});
