---
name: git-push
description: Commit and push all pending changes across all repos in the workspace. Dynamically discovers submodules from .gitmodules — works in both the template and scaffolded projects. Processes submodule repos first so the workspace root captures updated submodule pointers. Use when the user says "push to GitHub", "commit and push", "save to GitHub", or when the Stop hook reports unpushed changes.
disable-model-invocation: true
allowed-tools: Bash, Read
---

# Git Push — All Repos (Dynamic)

Commit and push any pending changes across all workspace repos.

**Important:** Process submodule repos FIRST, then the workspace root LAST — this ensures the root commit captures updated submodule pointers.

## Step 1: Discover Repos

Discover submodule repos dynamically from the workspace root:

```bash
# From workspace root — parse .gitmodules for submodule paths
git config --file .gitmodules --get-regexp path | awk '{print $2}'
```

If `.gitmodules` doesn't exist, fall back to scanning for directories containing `.git/`:
```bash
for d in *-web *-ios *-android */; do
  [ -d "$d/.git" ] && echo "$d"
done
```

Build the repo list:
1. All discovered submodules (in order found)
2. Workspace root (always last)

## Step 2: Status Check

Run `git status --short` and `git log --oneline @{u}..HEAD 2>/dev/null` in **each** repo.

Summarise findings in a table before doing anything:

| Repo | Uncommitted files | Unpushed commits | Has remote? |
|------|------------------|-----------------|-------------|
| <submodule-1> | ... | ... | yes/no |
| <submodule-2> | ... | ... | yes/no |
| workspace root | ... | ... | yes/no |

If nothing is pending anywhere, report "All repos are clean and up to date" and stop.

### Missing Remotes

If any repo has no `origin` remote:
1. Try to infer the GitHub org from another repo's remote URL:
   ```bash
   git remote get-url origin 2>/dev/null | sed 's|.*github.com[:/]\([^/]*\)/.*|\1|'
   ```
2. Offer to create the GitHub repo:
   ```
   "<repo-name>" has no remote. Create it on GitHub as <org>/<repo-name>? (requires gh CLI)
   ```
3. If user confirms:
   ```bash
   cd <repo-path>
   gh repo create <org>/<repo-name> --private --source . --push
   ```
4. If user declines or `gh` is unavailable, skip that repo and continue with the others.

## Step 3: For Each Submodule with Changes

Process in the order discovered. For each submodule that has uncommitted files or unpushed commits:

1. `cd` into the repo directory (use relative path from workspace root)
2. `git add -A` — stage everything
3. Generate a concise commit message:
   - Look at `git diff --cached --stat` to understand what changed
   - Use conventional commit style: `feat:`, `fix:`, `chore:`, `docs:` prefix
   - Keep under 72 characters
4. Commit using a HEREDOC:
   ```bash
   git commit -m "$(cat <<'EOF'
   <message>

   Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
   EOF
   )"
   ```
5. `git push origin main` (or whatever branch is checked out: `git rev-parse --abbrev-ref HEAD`)

Process each submodule independently — a failure in one should not block the others.

## Step 4: Workspace Root (Always Last)

After all submodule repos are committed and pushed:

1. `cd` back to workspace root
2. Check `git status --short` — submodule pointers will show as modified if any submodule was committed
3. `git add -A` — stage everything including updated submodule pointers
4. Generate commit message covering workspace-level changes AND submodule pointer updates
5. If only submodule pointers changed (no other files), use: `chore: update submodule pointers`
6. Commit and push same as above

## Step 5: Upstream Status (Informational)

After all pushes complete, check if any repo has an `upstream` remote:

```bash
git remote get-url upstream 2>/dev/null
```

If upstream exists, report how many commits behind:
```bash
git fetch upstream --quiet 2>/dev/null
git rev-list HEAD..upstream/main --count 2>/dev/null
```

Include in the summary table (no auto-pull — just inform).

## Step 6: Summary

Output a final table:

| Repo | Status | Commit | Upstream |
|------|--------|--------|----------|
| cool-app-web | Pushed | `feat: add login page` | 3 behind upstream |
| cool-app-ios | Nothing to push | — | up to date |
| workspace root | Pushed | `chore: update submodule pointers` | 12 behind upstream |

Include GitHub URLs where available (from `git remote get-url origin`).

## Rules

- **Submodules first, workspace root last** — always follow this order
- **Dynamic discovery** — never hardcode repo names or paths
- **Relative paths** — always `cd` using paths relative to workspace root
- Never force-push (`--force`)
- Never amend existing commits
- Never skip the status check — don't commit if nothing has changed
- If a push fails due to a diverged branch, report the error and ask the user how to proceed — do not auto-rebase or auto-merge
- Push to whatever branch is currently checked out (`git rev-parse --abbrev-ref HEAD`), not hardcoded `main`
