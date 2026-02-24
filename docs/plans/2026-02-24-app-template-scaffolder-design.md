# Plan: Multi-Platform App Template & Scaffolder

## Context

The current `multi-repo-sample` workspace has matured into a comprehensive cross-platform foundation: 15 atomic components, 4 patterns, 11-13 native wrappers, 2-3 adaptive wrappers, a two-layer design token pipeline, 13 Claude Code skills, 8 agents, 15+ hooks, and extensive documentation. The goal is to turn this into a **reusable project template** with an interactive scaffolder, so new multi-platform apps can be spun up quickly without re-doing setup.

**Target user:** Personal use only.
**Entry point:** Clone template repo → run `/new-project <name>` → answer questions → start building.

---

## Architecture

Three pieces:

| Piece | Purpose | Runs |
|-------|---------|------|
| `derive-template.sh` | One-time script that copies current workspace into a clean template repo with `{{PLACEHOLDER}}` tokens | Once, to create the template |
| `scaffold.sh` | Mechanical bash script in the template: find-and-replace placeholders, rename dirs, delete unwanted platforms | Per new project, called by the skill |
| `/new-project` skill | Interactive Claude Code skill: collects preferences, calls `scaffold.sh`, then intelligently edits CLAUDE.md/skills/agents/hooks/docs | Per new project |

---

## Step 1: `derive-template.sh`

**Location:** Run from current workspace root. Outputs to a sibling directory (e.g., `../app-template/`).

**What it does:**
1. Copy entire workspace to target directory
2. Strip demo content:
   - Delete `multi-repo-nextjs/app/components-showcase/`, `app/editor-demo/`, `app/input-demo/`
   - Clear `ContentView.swift` to minimal placeholder
   - Clear `ShowcaseScreen.kt` / `HomeScreen.kt` to minimal placeholder
3. Strip git history: `rm -rf .git` in root and each sub-repo, then `git init`
4. Clear session-specific docs: empty `docs/plans/`, keep `docs/PRDs/prd-template.md`
5. Clear Supabase migrations: empty `supabase/migrations/`
6. Replace project-specific strings with placeholders (see registry below)
7. Keep OpenAI agent builder plugin as-is (optional feature, removed by scaffolder if unwanted)

### Placeholder Registry

| Placeholder | Current Value | Affected Files |
|---|---|---|
| `{{PROJECT_NAME}}` | `multi-repo-sample` | Root dir refs in CLAUDE.md, docs, skills, agents, hooks, `.mcp.json` |
| `{{PROJECT_PASCAL}}` | `MultiRepo` | Swift struct names, Kotlin class names |
| `{{PROJECT_SNAKE}}` | `multi_repo` | `multi_repo_iosApp.swift` struct name |
| `{{PROJECT_KEBAB}}` | `multi-repo` | Directory names prefix |
| `{{WEB_DIR}}` | `multi-repo-nextjs` | ~20 files (CLAUDE.md, skills, hooks, agents) |
| `{{IOS_DIR}}` | `multi-repo-ios` | ~15 files |
| `{{ANDROID_DIR}}` | `multi-repo-android` | ~10 files |
| `{{IOS_BUNDLE_ID}}` | `com.abhishekverma.multi-repo-ios` | `project.pbxproj`, iOS CLAUDE.md |
| `{{ANDROID_PACKAGE}}` | `com.abhishekverma.multirepo` | 54 Kotlin files, `build.gradle.kts` |
| `{{ANDROID_PACKAGE_PATH}}` | `com/abhishekverma/multirepo` | Directory structure under `app/src/main/java/` |
| `{{TEAM_ID}}` | `L6KKWH5M53` | `project.pbxproj`, iOS CLAUDE.md |
| `{{FIGMA_FILE_KEY}}` | `ZtcCQT96M2dJZjU35X8uMQ` | `docs/components.md`, agents |

### Critical files for placeholder injection
- `.claude/settings.json` — hardcoded absolute paths in hooks (e.g., `/Users/abhishekverma/Documents/multi-repo-sample`)
- `.claude/settings.local.json` — permission paths
- `.claude/skills/*/SKILL.md` — workspace path references
- `.claude/agents/*.md` — platform directory references
- `CLAUDE.md` (root + 3 platform CLAUDEs)
- `docs/components.md`, `docs/design-tokens.md`, `docs/api-contracts.md`
- `multi-repo-ios/multi-repo-ios.xcodeproj/project.pbxproj` — bundle ID, team ID, product name
- `multi-repo-android/app/build.gradle.kts` — namespace, applicationId
- `multi-repo-android/settings.gradle.kts` — rootProject.name

---

## Step 2: `scaffold.sh`

**Location:** Template repo root: `scaffold.sh`

**Input:** Reads `scaffold-config.json` (written by the `/new-project` skill):
```json
{
  "projectName": "my-cool-app",
  "projectPascal": "MyCoolApp",
  "projectSnake": "my_cool_app",
  "projectKebab": "my-cool-app",
  "webDir": "my-cool-app-web",
  "iosDir": "my-cool-app-ios",
  "androidDir": "my-cool-app-android",
  "iosBundleId": "com.me.mycoolapp",
  "androidPackage": "com.me.mycoolapp",
  "androidPackagePath": "com/me/mycoolapp",
  "teamId": "XXXXXXXXXX",
  "figmaFileKey": "",
  "platforms": ["web", "ios", "android"],
  "includeSupabase": true,
  "includeOpenAIPlugin": false,
  "includeDemoPages": false,
  "includeFigma": true
}
```

**What it does:**
1. **Find-and-replace** all `{{PLACEHOLDER}}` strings across every file (using `sed` or `perl`)
2. **Rename directories:**
   - `{{WEB_DIR}}/` → `my-cool-app-web/`
   - `{{IOS_DIR}}/` → `my-cool-app-ios/`
   - `{{ANDROID_DIR}}/` → `my-cool-app-android/`
   - Android package path: move `app/src/main/java/{{ANDROID_PACKAGE_PATH}}/` → new path
3. **Rename files:** iOS xcodeproj folder, Swift module files
4. **Delete excluded platforms:** `rm -rf` the directory for any platform not in `platforms[]`
5. **Delete optional features:**
   - No Supabase → delete `supabase/`, platform Supabase client files, `supabase-setup` skill
   - No OpenAI plugin → delete `.claude/plugins/openai-agent-builder/`
   - No Figma → remove `figma-component-sync` skill, `design-system-sync` agent, Figma entry from `.mcp.json`
6. **Clean up** `scaffold.sh`, `scaffold-config.json`, and `derive-template.sh` (self-destruct)

---

## Step 3: `/new-project` Skill

**Location:** `.claude/skills/new-project/SKILL.md`

### Interactive Flow

```
1. AskUserQuestion: Project name (kebab-case)
   → Derives: PascalCase, snake_case, dir names
2. AskUserQuestion: Which platforms? [Web, iOS, Android] (multi-select, min 1)
3. AskUserQuestion (if iOS): Bundle ID prefix? (default: com.{{user}}.{{projectKebab}})
4. AskUserQuestion (if Android): Package name? (default: com.{{user}}.{{projectKebab}})
5. AskUserQuestion (if iOS): Apple Team ID?
6. AskUserQuestion: Optional features? [Supabase, OpenAI plugin, Demo pages, Figma] (multi-select)
7. AskUserQuestion (if Figma): Figma file key?
```

### After collecting answers

1. **Write** `scaffold-config.json`
2. **Run** `bash scaffold.sh` — handles all mechanical transformations
3. **Intelligent edits** (Claude uses Edit tool):

   **CLAUDE.md (root):**
   - Remove sections for absent platforms (e.g., `## multi-repo-ios` section)
   - Remove absent-platform columns from all tables (Components, Tokens, Icons, Screens, etc.)
   - Remove absent-platform entries from Skills/Agents/Hooks tables
   - Adjust cross-platform conventions to only reference present platforms

   **Skills (7 cross-platform skills need editing):**
   - `cross-platform-feature/SKILL.md` — remove phases for absent platforms
   - `new-screen/SKILL.md` — remove absent-platform scaffold steps
   - `design-token-sync/SKILL.md` — remove absent-platform sync targets
   - `prd-update/SKILL.md` — remove absent-platform audit steps
   - `git-push/SKILL.md` — remove absent-platform repo checks
   - `component-audit/SKILL.md` — remove absent-platform parity checks
   - `post-session-review/SKILL.md` — remove absent-platform checklist items

   **Skills to delete if platform absent:**
   - No iOS → delete `ios-native-components/`
   - No Android → delete `android-native-components/`

   **Agents (all 6 need editing):**
   - Remove absent-platform instructions, checklists, and table columns from each agent `.md`

   **Hooks (`settings.json`):**
   - Regenerate the entire file, removing absent-platform branches from each inline Python hook
   - Remove hooks that only apply to absent platforms (e.g., `auto-lint` is web-only)
   - Adjust the Stop hook's repo list

   **Docs:**
   - `docs/components.md` — remove absent-platform columns from component tables
   - `docs/design-tokens.md` — remove absent-platform columns from token mapping tables
   - `docs/api-contracts.md` — remove absent-platform type columns

4. **Git init** — fresh `git init` in root and each platform dir
5. **Self-cleanup** — delete `/new-project` skill directory, `scaffold.sh`, `scaffold-config.json`

---

## Step 4: Handle Edge Cases

### MarkdownEditor gap
MarkdownEditor exists on web (4 files) and iOS (6 files) but not Android. The template keeps it as-is. If Android-only project, MarkdownEditor files are deleted with the web/iOS dirs. If web+Android or iOS+Android, the component registry notes it's not available on Android.

### AdaptiveSplitView gap
Only implemented on Android. Web and iOS have it marked "In Progress" in `docs/components.md`. Template preserves this status.

### Single-platform project
If only one platform is selected, cross-platform skills become single-platform. The `/new-project` skill simplifies them (e.g., `cross-platform-feature` becomes just a feature scaffolder for that platform). Cross-platform agents and hooks that don't apply get deleted entirely.

### Absolute paths in hooks
The Stop hook in `settings.json` contains hardcoded absolute paths (`/Users/abhishekverma/Documents/multi-repo-sample`). The derive script replaces these with `{{PROJECT_ROOT}}`, and `scaffold.sh` replaces `{{PROJECT_ROOT}}` with the actual `pwd` at scaffold time.

---

## Implementation Order

| # | Task | Output |
|---|------|--------|
| 1 | Write `derive-template.sh` | Script that creates the template repo |
| 2 | Run `derive-template.sh` to create template | `../app-template/` directory |
| 3 | Verify template: check all placeholders injected correctly | Manual review |
| 4 | Write `scaffold.sh` in template | Mechanical transformation script |
| 5 | Write `/new-project` SKILL.md in template | Interactive Claude Code skill |
| 6 | Write template `README.md` | Brief usage instructions |
| 7 | Test: clone template, run `/new-project`, verify output | End-to-end validation |

---

## Verification

1. **Derive test:** Run `derive-template.sh`, then `grep -r "abhishekverma\|multi-repo-sample\|L6KKWH5M53\|ZtcCQT96M2dJZjU35X8uMQ"` in the template — should find zero matches (only `{{PLACEHOLDER}}` tokens)
2. **Scaffold test (all platforms):** Clone template, run `/new-project test-app` with all 3 platforms → verify:
   - All files renamed correctly
   - `xcodebuild` compiles iOS project
   - `./gradlew assembleDebug` compiles Android project
   - `npm run build` succeeds for web
   - All hooks fire correctly (no broken path references)
   - CLAUDE.md reads coherently with correct project name
3. **Scaffold test (single platform):** Clone template, run `/new-project web-only` with only web → verify:
   - iOS and Android dirs deleted
   - No references to iOS/Android in CLAUDE.md, skills, hooks
   - Web-only skills and hooks work correctly
4. **Scaffold test (no optional features):** Exclude Supabase, OpenAI plugin, Figma → verify clean removal
