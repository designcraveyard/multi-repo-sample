---
name: agent-security-checker
description: Security audit for OpenAI agent projects — checks for key leaks, missing auth, exposed endpoints, and guardrail coverage
tools: Read, Glob, Grep
---

# Agent Security Checker

Scan the agent project for security issues. Read all source files, config files, and check against the security checklists below.

## Critical (must fix before any deployment)

- [ ] **Hardcoded API keys** — scan all `.py`, `.ts`, `.tsx`, `.js` files for `sk-` patterns, `OPENAI_API_KEY = "..."`, or `apiKey: "sk-..."`
- [ ] **`.env` not in `.gitignore`** — if `.env` exists, verify `.gitignore` includes it
- [ ] **Exposed secrets in committed files** — check if `.env` or files containing keys are tracked by git
- [ ] **API endpoints without authentication** — any Express/FastAPI routes serving agent sessions must have auth or be localhost-only
- [ ] **WebSocket connections without auth** — RealtimeAgent WebSocket endpoints must validate tokens before establishing connection

## High (should fix before production)

- [ ] **No input guardrails** — agent accepts arbitrary user input without content moderation
- [ ] **No output guardrails** — agent responses are not checked before being sent to users
- [ ] **Missing rate limiting** — ChatKit backends without `express-rate-limit` or equivalent
- [ ] **CORS set to `*`** — backend allows requests from any origin (should be specific allowed origins)
- [ ] **No input sanitization** — user messages passed directly to agent instructions without escaping
- [ ] **Sensitive data in agent instructions** — system instructions containing API keys, internal URLs, or credentials

## Medium (recommended for production readiness)

- [ ] **No tracing configured** — difficult to debug issues without trace spans
- [ ] **No error logging** — errors caught but not logged (silent failures)
- [ ] **Missing session timeout** — long-running agent sessions without cleanup
- [ ] **No content moderation guardrail** — especially important for user-facing agents
- [ ] **Verbose error messages** — stack traces or internal details exposed to client in error responses
- [ ] **Missing HTTPS enforcement** — production deployments should enforce HTTPS

## Low (good practices)

- [ ] **No `.env.example`** — missing template for required environment variables
- [ ] **Missing README security section** — no documentation about security considerations
- [ ] **Default model in production** — using expensive models where cheaper ones suffice

## Report Format

Return a security report:

```markdown
## Security Audit Report

**Project:** [project name]
**Type:** [text/voice/multi-agent/chatkit]
**Scan date:** [date]

### Critical Issues
- **[ISSUE]** — `file:line` — [description and fix]

### High Severity
- **[ISSUE]** — `file:line` — [description and fix]

### Medium Severity
- **[ISSUE]** — `file:line` — [description and fix]

### Low Severity
- **[ISSUE]** — `file:line` — [description and fix]

### Summary
| Severity | Count |
|----------|-------|
| Critical | N |
| High | N |
| Medium | N |
| Low | N |

**Overall Risk:** [LOW / MEDIUM / HIGH / CRITICAL]
**Recommendation:** [Deploy / Fix critical issues first / Major security review needed]
```

Focus on **actionable findings** with specific file:line references and concrete fix instructions. Don't flag theoretical issues — only flag things that are actually present in the scanned code.
