# asset-gen Plugin

Provides Node.js scripts that Claude calls via Bash to generate and iterate on visual assets using the OpenAI `gpt-image-1` model.

## Scripts

| Script | Purpose |
|--------|---------|
| `generate.js` | Generate one or more assets from a JSON spec |
| `iterate.js` | Variations or prompt-refined regeneration of existing assets |

## API Key

Read from `.env.local` at the workspace root. Never committed to git.
Expected key: `OPENAI_API_KEY=sk-...`

Usage: both scripts accept `--env <path-to-env-file>` to load the key at runtime.

## Manifest

`assets/generated/manifest.json` — tracks every asset ever generated:

```json
{
  "assets": [
    {
      "id": "empty-state-notes",
      "category": "empty-states",
      "label": "Empty State — Notes Screen",
      "currentVersion": "v2",
      "approved": true,
      "versions": [
        {
          "version": "v1",
          "path": "assets/generated/empty-states/empty-state-notes-v1.png",
          "prompt": "...",
          "model": "gpt-image-1",
          "size": "1024x1024",
          "quality": "high",
          "referenceImages": [],
          "generatedAt": "2026-03-01T10:00:00Z",
          "iterationType": "initial"
        },
        {
          "version": "v2",
          "path": "assets/generated/empty-states/empty-state-notes-v2.png",
          "prompt": "...",
          "model": "gpt-image-1",
          "size": "1024x1024",
          "quality": "high",
          "referenceImages": [],
          "generatedAt": "2026-03-01T11:30:00Z",
          "iterationType": "refinement",
          "changeLog": "Removed character, simplified to sparse minimal composition"
        }
      ]
    }
  ]
}
```

## Size Reference

| Asset category | Recommended size |
|---------------|-----------------|
| app-icon | 1024x1024 |
| splash | 1792x1024 (landscape) or 1024x1792 (portrait) |
| onboarding | 1024x1024 or 1024x1792 |
| empty-states | 1024x1024 |
| hero | 1792x1024 |
| patterns | 1024x1024 (tileable) |
| social | 1792x1024 |

## Running manually

```bash
# Install dependencies (first time only)
cd .claude/plugins/asset-gen && npm install

# Generate from a spec file
node .claude/plugins/asset-gen/generate.js --spec /tmp/asset-gen-spec.json --env .env.local

# Iterate on existing assets
node .claude/plugins/asset-gen/iterate.js --spec /tmp/asset-iterate-spec.json --env .env.local
```
