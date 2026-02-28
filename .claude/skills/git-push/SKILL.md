---
name: git-push
description: Commit and push all pending changes across all five repos in the workspace (multi-repo-nextjs, multi-repo-ios, multi-repo-android, figma-cli, then workspace root last). Use when the user says "push to GitHub", "commit and push", "save to GitHub", or when the Stop hook reports unpushed changes. Processes submodule repos first so the workspace root captures updated submodule pointers.
disable-model-invocation: true
allowed-tools: Bash, Read
---

# Git Push — All Repos

Commit and push any pending changes across all five workspace repos.

**Important:** Process submodule repos FIRST, then the workspace root LAST — this ensures the root commit captures updated submodule pointers.

## Repos (in processing order)

| # | Repo | Path |
|---|------|------|
| 1 | Next.js | `/Users/abhishekverma/Documents/GitHub/multi-repo-sample/multi-repo-nextjs` |
| 2 | iOS | `/Users/abhishekverma/Documents/GitHub/multi-repo-sample/multi-repo-ios` |
| 3 | Android | `/Users/abhishekverma/Documents/GitHub/multi-repo-sample/multi-repo-android` |
| 4 | figma-cli | `/Users/abhishekverma/Documents/GitHub/multi-repo-sample/figma-cli` |
| 5 | workspace root | `/Users/abhishekverma/Documents/GitHub/multi-repo-sample` |

## Workflow

### Step 1: Status Check

Run `git status --short` and `git log --oneline @{u}..HEAD 2>/dev/null` in each repo to see what's pending.
Summarise findings in a table before doing anything:

| Repo | Uncommitted files | Unpushed commits |
|------|------------------|-----------------|
| Next.js | ... | ... |
| iOS | ... | ... |
| Android | ... | ... |
| figma-cli | ... | ... |
| workspace | ... | ... |

If nothing is pending anywhere, report "All repos are clean and up to date" and stop.

### Step 2: For each submodule repo that has changes (steps 1–4)

Process in order: Next.js → iOS → Android → figma-cli.

1. `cd` into the repo directory
2. `git add -A` — stage everything (new, modified, deleted)
3. Generate a concise commit message:
   - Look at `git diff --cached --stat` to understand what changed
   - Use conventional commit style: `feat:`, `fix:`, `chore:`, `docs:` prefix as appropriate
   - Keep it under 72 characters
4. Commit using a HEREDOC for proper formatting:
   ```bash
   git commit -m "$(cat <<'EOF'
   <message>

   Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
   EOF
   )"
   ```
5. `git push origin main`

Process each submodule independently — a failure in one should not block the others.

### Step 3: Workspace root (step 5 — always last)

After all submodule repos are committed and pushed:

1. `cd` back to workspace root
2. Check `git status --short` — submodule pointers will show as modified if any submodule was committed
3. `git add -A` — stage everything including updated submodule pointers
4. Generate commit message covering workspace-level changes AND submodule pointer updates
5. Commit and push same as above

### Step 4: Summary

Output a final table:

| Repo | Status | Commit | Link |
|------|--------|--------|------|
| Next.js | ✅ Pushed | `feat: add user profile page` | github.com/designcraveyard/multi-repo-nextjs |
| iOS | ⏭️ Nothing to push | — | — |
| Android | ✅ Pushed | `feat: add user profile screen` | github.com/designcraveyard/multi-repo-android |
| figma-cli | ⏭️ Nothing to push | — | — |
| workspace | ✅ Pushed | `chore: update submodule pointers` | github.com/designcraveyard/multi-repo-sample |

## Rules

- **Submodules first, workspace root last** — always follow this order
- Never force-push (`--force`)
- Never amend existing commits
- Never skip the status check — don't commit if nothing has changed
- If a push fails due to a diverged branch, report the error and ask the user how to proceed — do not auto-rebase or auto-merge
- If only submodule pointers changed in the workspace root (no other files), use commit message `chore: update submodule pointers`
