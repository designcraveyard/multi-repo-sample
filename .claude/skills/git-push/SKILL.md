---
name: git-push
description: Commit and push all pending changes across all four repos in the workspace (multi-repo-sample root, multi-repo-nextjs, multi-repo-ios, multi-repo-android). Use when the user says "push to GitHub", "commit and push", "save to GitHub", or when the Stop hook reports unpushed changes. Stages all tracked + untracked files in each repo, writes a commit message, and pushes to origin/main.
disable-model-invocation: true
allowed-tools: Bash, Read
---

# Git Push — All Repos

Commit and push any pending changes across all four workspace repos.

## Repos to Check

| Repo | Path |
|------|------|
| workspace root | `/Users/abhishekverma/Documents/multi-repo-sample` |
| Next.js | `/Users/abhishekverma/Documents/multi-repo-sample/multi-repo-nextjs` |
| iOS | `/Users/abhishekverma/Documents/multi-repo-sample/multi-repo-ios` |
| Android | `/Users/abhishekverma/Documents/multi-repo-sample/multi-repo-android` |

## Workflow

### Step 1: Status Check

Run `git status --short` and `git log --oneline @{u}..HEAD` in each repo to see what's pending.
Summarise findings in a table before doing anything:

| Repo | Uncommitted files | Unpushed commits |
|------|------------------|-----------------|
| workspace | ... | ... |
| Next.js | ... | ... |
| iOS | ... | ... |
| Android | ... | ... |

If nothing is pending anywhere, report "All repos are clean and up to date" and stop.

### Step 2: For each repo that has changes

1. `git add -A` — stage everything (new, modified, deleted)
2. Generate a concise commit message:
   - Look at `git diff --cached --stat` to understand what changed
   - Use conventional commit style: `feat:`, `fix:`, `chore:`, `docs:` prefix as appropriate
   - Keep it under 72 characters
3. `git commit -m "<message>\n\nCo-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"`
4. `git push origin main`

Process each repo independently — a failure in one should not block the others.

### Step 3: Summary

Output a final table:

| Repo | Status | Commit | Link |
|------|--------|--------|------|
| workspace | ✅ Pushed | `chore: update skills` | github.com/designcraveyard/multi-repo-sample |
| Next.js | ✅ Pushed | `feat: add user profile page` | github.com/designcraveyard/multi-repo-nextjs |
| iOS | ⏭️ Nothing to push | — | — |
| Android | ✅ Pushed | `feat: add user profile screen` | github.com/designcraveyard/multi-repo-android |

## Rules

- Never force-push (`--force`)
- Never amend existing commits
- Never skip the `--porcelain` / `git log` check — don't commit if nothing has changed
- If a push fails due to a diverged branch, report the error and ask the user how to proceed — do not auto-rebase or auto-merge
