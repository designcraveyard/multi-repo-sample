---
name: supabase-auth-setup
description: Interactive wizard that guides through configuring Supabase authentication with Google, Apple, and Email providers. Walks through Google Cloud Console, Apple Developer Portal, Supabase Dashboard, and env file setup step by step. Use after code scaffolding is done (via /supabase-setup) to configure the external services and apply migrations.
user-invocable: true
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, AskUserQuestion, ToolSearch
metadata:
  mcp-server: supabase
---

# Supabase Auth Setup Wizard

Interactive, step-by-step configuration of Supabase authentication across all three platforms.

**This skill handles external service configuration, NOT code scaffolding.** It assumes auth code already exists (from the template or `/supabase-setup`). It guides the user through dashboard/console configuration and wires credentials into env files.

## Arguments

`$ARGUMENTS` — Optional flags:
- `--skip-google` — Skip Google OAuth setup
- `--skip-apple` — Skip Apple Sign-In setup
- `--skip-email` — Skip email auth configuration

If no arguments, configure all three providers.

## Workflow

### Phase 1: Prerequisites Check

Run these checks silently and report status:

```bash
# 1. Supabase CLI
supabase --version 2>/dev/null || echo "CLI_MISSING"

# 2. Project linked?
supabase status 2>/dev/null | grep "API URL" || echo "NOT_LINKED"

# 3. Auth code exists?
ls multi-repo-nextjs/lib/supabase/client.ts 2>/dev/null || echo "WEB_CLIENT_MISSING"
ls multi-repo-nextjs/middleware.ts 2>/dev/null || echo "MIDDLEWARE_MISSING"
ls multi-repo-nextjs/lib/auth/actions.ts 2>/dev/null || echo "AUTH_ACTIONS_MISSING"

# 4. iOS auth code?
find multi-repo-ios -name "AuthManager.swift" 2>/dev/null | head -1 || echo "IOS_AUTH_MISSING"

# 5. Android auth code?
find multi-repo-android -name "AuthRepository.kt" 2>/dev/null | head -1 || echo "ANDROID_AUTH_MISSING"

# 6. Migrations exist?
ls supabase/migrations/*profiles* 2>/dev/null || echo "MIGRATIONS_MISSING"
```

**If CLI is missing:** Tell user to install: `brew install supabase/tap/supabase`

**If auth code is missing:** Tell user to run the template scaffolder or implement auth code first. Offer to continue with just the providers that have code.

**If not linked:** Proceed to Phase 2. If already linked, skip to Phase 3.

Report a status table:

```
Prerequisite        Status
-----------------   ------
Supabase CLI        [checkmark or X]
Project linked      [checkmark or X]
Web auth code       [checkmark or X]
iOS auth code       [checkmark or X]
Android auth code   [checkmark or X]
DB migrations       [checkmark or X]
```

### Phase 2: Create & Link Supabase Project

#### Step 2.0 — Verify Supabase Account

Before creating or linking a project, confirm the correct Supabase account is connected:

```
# List orgs to show which account is active
mcp__claude_ai_Supabase__list_organizations
```

Show the user the connected organization name(s) and ask:
```
AskUserQuestion: "The Supabase MCP is connected to the following organization(s). Is this the correct account?"
Options:
  A) Yes, use this account
  B) No, I need to switch accounts
```

**If switching accounts:** Guide the user:
```
To connect a different Supabase account:
1. Go to Claude settings > Integrations > Supabase
2. Disconnect the current account
3. Reconnect and authorize with the desired Supabase account
4. Re-run /supabase-auth-setup
```
Stop the wizard here until they reconnect.

#### Step 2.1 — Project Selection

Use `AskUserQuestion` to determine the setup path:

**Question:** "Do you have an existing Supabase project, or should we create a new one?"

**Option A — Existing project:**

Ask for the project reference ID:
```
AskUserQuestion: "What is your Supabase project reference ID?"
  (Find it at: Supabase Dashboard > Project Settings > General > Reference ID)
```

Then link:
```bash
supabase link --project-ref <ref>
```

**Option B — Create new:**

Attempt to use the Supabase MCP server if available:
```
ToolSearch: "+supabase create project"
```

If MCP is available, use `mcp__claude_ai_Supabase__create_project`. Otherwise, guide the user:

```
Manual steps:
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Choose organization, set project name, database password, and region
4. Wait for provisioning (~2 minutes)
5. Copy the project reference ID from Settings > General
```

Ask for the reference ID after creation, then link.

**After linking**, fetch credentials:
```bash
supabase status | grep -E "API URL|anon key"
```

Or use MCP:
```
mcp__claude_ai_Supabase__get_project_url
mcp__claude_ai_Supabase__get_publishable_keys
```

Store the URL and anon key for Phase 6 (env file writing).

### Phase 3: Google OAuth Setup

**Skip if `--skip-google` flag is set.**

Guide the user through Google Cloud Console step by step. Use `AskUserQuestion` at each decision point.

#### Step 3.1 — Google Cloud Project

```
AskUserQuestion: "Do you have a Google Cloud project for this app?"
Options:
  A) Yes, I have one
  B) No, I need to create one
```

**If creating new:**
```
1. Go to https://console.cloud.google.com/
2. Click "Select a project" dropdown in the top bar
3. Click "New Project"
4. Enter project name (e.g. "multi-repo-app")
5. Click "Create"
6. Select the new project from the dropdown
```

#### Step 3.2 — Enable Google Identity API

```
1. In Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google Identity Services" (or "Google Sign-In")
3. Click "Enable"
```

#### Step 3.3 — OAuth Consent Screen

```
1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" user type
3. Fill in:
   - App name: your app name
   - User support email: your email
   - Developer contact info: your email
4. Click "Save and Continue" through Scopes and Test Users
5. Click "Back to Dashboard"
```

#### Step 3.4 — Create OAuth Credentials

Three client IDs are needed. Guide through each:

**Web Application Client (required for Supabase + Android Credential Manager):**
```
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Application type: "Web application"
4. Name: "Web Client"
5. Authorized redirect URIs: Add your Supabase callback URL:
   https://<project-ref>.supabase.co/auth/v1/callback
6. Click "Create"
7. Copy the Client ID and Client Secret
```

Ask for the values:
```
AskUserQuestion: "Please paste the Web Application Client ID and Client Secret"
  - Client ID (ends with .apps.googleusercontent.com)
  - Client Secret
```

**iOS Client (required for GoogleSignIn-iOS SDK):**
```
1. Click "Create Credentials" > "OAuth client ID" again
2. Application type: "iOS"
3. Name: "iOS Client"
4. Bundle ID: com.abhishekverma.multi-repo-ios
5. Click "Create"
6. Copy the Client ID
7. Download the plist — note the REVERSED_CLIENT_ID value
```

Ask:
```
AskUserQuestion: "Please paste the iOS Client ID and the REVERSED_CLIENT_ID from the plist"
```

**Android Client (optional — Credential Manager uses the Web client ID):**
```
Note: Android Credential Manager uses the WEB client ID, not an Android client ID.
No separate Android OAuth client is needed for the Google Sign-In flow.
If you need Google APIs access directly from Android, create an Android client with your SHA-1 fingerprint.
```

#### Step 3.5 — Configure Supabase Dashboard

```
1. Go to Supabase Dashboard > Authentication > Providers > Google
2. Enable Google
3. Paste the Web Application Client ID
4. Paste the Web Application Client Secret
5. Click "Save"
```

Or use MCP if available to verify the configuration.

### Phase 4: Apple Sign-In Setup

**Skip if `--skip-apple` flag is set.**

#### Step 4.1 — Enable Capability

```
1. Go to https://developer.apple.com/account/resources/identifiers/list
2. Find your App ID (com.abhishekverma.multi-repo-ios)
3. Click it > enable "Sign In with Apple" capability
4. Save

In Xcode:
1. Select your project > target > "Signing & Capabilities"
2. Click "+ Capability"
3. Add "Sign In with Apple"
```

#### Step 4.2 — Create Services ID (for web OAuth)

```
1. In Apple Developer > Identifiers, click "+" button
2. Select "Services IDs" and continue
3. Description: "Multi Repo Web Auth"
4. Identifier: com.abhishekverma.multi-repo-web (or similar)
5. Register
6. Click the newly created Services ID
7. Enable "Sign In with Apple"
8. Click "Configure" next to it
9. Primary App ID: select your iOS app
10. Domains: add your Supabase project domain
    (e.g. <project-ref>.supabase.co)
11. Return URLs: add
    https://<project-ref>.supabase.co/auth/v1/callback
12. Save
```

Ask:
```
AskUserQuestion: "Please paste the Services ID identifier (e.g. com.abhishekverma.multi-repo-web)"
```

#### Step 4.3 — Generate Private Key

```
1. In Apple Developer > Keys, click "+" button
2. Key Name: "Multi Repo Supabase Auth"
3. Enable "Sign In with Apple"
4. Click "Configure" > select your Primary App ID
5. Register > Download the .p8 key file
6. NOTE: Save the Key ID shown on the confirmation page
7. Your Team ID is in the top-right of the developer portal (or Membership page)
```

Ask for values:
```
AskUserQuestion: "Please provide these Apple Sign-In values:"
  - Team ID (10-character alphanumeric, from Membership page)
  - Key ID (from the key download page)
  - Path to the .p8 key file you downloaded
```

#### Step 4.4 — Configure Supabase Dashboard

```
1. Go to Supabase Dashboard > Authentication > Providers > Apple
2. Enable Apple
3. Fill in:
   - Client ID: the Services ID (e.g. com.abhishekverma.multi-repo-web)
   - Secret Key: paste the CONTENTS of the .p8 file
   - Team ID: your Team ID
   - Key ID: the Key ID from step 4.3
4. Click "Save"
```

Read the .p8 file content and display it for the user to paste, or offer to use MCP.

### Phase 5: Email Auth Configuration

**Skip if `--skip-email` flag is set.**

Email/password auth is enabled by default in Supabase. Check `supabase/config.toml`:

```toml
[auth]
enabled = true

[auth.email]
enable_signup = true
enable_confirmations = false  # false for dev, true for production
```

Ask:
```
AskUserQuestion: "Email auth configuration:"
Options:
  A) Development mode (no email confirmations) — Recommended for now
  B) Production mode (require email confirmation)
```

**If production mode:**
Guide through SMTP setup:
```
1. Supabase Dashboard > Project Settings > Authentication > SMTP Settings
2. Enable Custom SMTP
3. Configure with your email provider (e.g., Resend, SendGrid, Mailgun):
   - Sender email
   - SMTP host
   - SMTP port (587 for TLS)
   - Username / Password
4. Save and send a test email
```

### Phase 6: Write Environment Files

Based on the collected credentials, write to all env files.

**Web — `multi-repo-nextjs/.env.local`:**
```
NEXT_PUBLIC_SUPABASE_URL=https://<collected-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<collected-key>
```

**iOS — Display instructions:**
```
In Xcode: Edit Scheme > Run > Arguments > Environment Variables:
  SUPABASE_URL = https://<collected-url>
  SUPABASE_ANON_KEY = <collected-key>

For Google Sign-In, add to Info.plist URL Schemes:
  <collected-reversed-client-id>
```

**Android — `multi-repo-android/local.properties`:**
Read the existing file first, then append if keys are missing:
```
SUPABASE_URL=https://<collected-url>
SUPABASE_ANON_KEY=<collected-key>
GOOGLE_WEB_CLIENT_ID=<collected-web-client-id>
```

**Supabase — `supabase/.env`:**
```
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=<web-client-id>
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=<web-client-secret>
SUPABASE_AUTH_EXTERNAL_APPLE_CLIENT_ID=<services-id>
SUPABASE_AUTH_EXTERNAL_APPLE_SECRET=<p8-key-contents>
```

### Phase 7: Apply Migrations

```bash
# Apply migrations to the linked project
supabase db push

# Generate updated TypeScript types
supabase gen types typescript --linked > multi-repo-nextjs/lib/database.types.ts
```

If MCP is available, verify with:
```
mcp__claude_ai_Supabase__list_tables
mcp__claude_ai_Supabase__execute_sql — SELECT * FROM information_schema.tables WHERE table_name = 'profiles'
```

### Phase 8: Verification Checklist

Present an interactive checklist. Use `AskUserQuestion` for each group:

```
AskUserQuestion: "Let's verify everything works. Please test each item and report back:"
Options (multiSelect):
  [ ] Supabase Studio shows `profiles` table with 3 RLS policies
  [ ] Web: `npm run dev` → `/login` renders correctly
  [ ] Web: Google OAuth redirect works (click "Login via Google")
  [ ] Web: Apple OAuth redirect works (click "Login via Apple")
  [ ] Web: Email signup creates a user + profile row
  [ ] iOS: Xcode build succeeds with Supabase + GoogleSignIn SPM packages
  [ ] iOS: App shows login screen on launch
  [ ] Android: `./gradlew assembleDebug` succeeds
  [ ] Android: App shows login screen on launch
  [ ] Logout returns to login screen on all platforms
```

For any unchecked items, offer targeted troubleshooting:
- **Build failures:** Check package versions, missing imports
- **OAuth redirect issues:** Verify redirect URLs match between Google Console / Apple Developer and Supabase Dashboard
- **Profile not created:** Check the trigger exists in Supabase Studio > Database > Triggers
- **Login screen not showing:** Check auth gate in app entry point

### Phase 9: Summary

Print a final summary:

```
## Supabase Auth Setup Complete

Providers configured:
  [checkmark] Google OAuth (Web + iOS + Android)
  [checkmark] Apple Sign-In (iOS native + Web)
  [checkmark] Email/Password

Credentials written to:
  - multi-repo-nextjs/.env.local
  - multi-repo-android/local.properties
  - supabase/.env
  - iOS: Xcode scheme environment variables (manual)

Database:
  - profiles table with RLS policies
  - Auto-create trigger on auth.users

Manual steps remaining:
  1. Add supabase-swift SPM package in Xcode (if not done)
  2. Add GoogleSignIn-iOS SPM package in Xcode (if not done)
  3. Add Sign In with Apple capability in Xcode (if not done)
  4. Add reversed Google client ID to iOS Info.plist URL Schemes
  5. For production: enable email confirmations + configure SMTP
```
