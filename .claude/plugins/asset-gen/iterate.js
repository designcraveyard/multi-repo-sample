#!/usr/bin/env node
/**
 * asset-gen/iterate.js
 *
 * Iterates on previously generated assets via three modes:
 *   - variations: generate N variations with the original prompt
 *   - refinement: generate with a rewritten prompt
 *   - reference-guided: generate using a new reference image + revised prompt
 *
 * Usage:
 *   node iterate.js --spec /tmp/asset-iterate-spec.json --env .env.local
 *
 * Spec format (array of iteration entries):
 * [
 *   {
 *     "mode": "variations",
 *     "assetId": "empty-state-notes",
 *     "sourcePrompt": "...",
 *     "count": 3,
 *     "outputPaths": [
 *       "assets/generated/empty-states/empty-state-notes-v2a.png",
 *       "assets/generated/empty-states/empty-state-notes-v2b.png",
 *       "assets/generated/empty-states/empty-state-notes-v2c.png"
 *     ]
 *   },
 *   {
 *     "mode": "refinement",
 *     "assetId": "app-icon",
 *     "originalPrompt": "...",
 *     "revisedPrompt": "...",
 *     "changeLog": "...",
 *     "size": "1024x1024",
 *     "quality": "high",
 *     "outputPath": "assets/generated/app-icon/app-icon-v2.png"
 *   },
 *   {
 *     "mode": "reference-guided",
 *     "assetId": "hero",
 *     "revisedPrompt": "...",
 *     "referenceImage": "path/to/reference.png",
 *     "size": "1792x1024",
 *     "quality": "high",
 *     "outputPath": "assets/generated/hero/hero-v2.png"
 *   }
 * ]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- Parse CLI args ---
const args = process.argv.slice(2);
const getArg = (flag) => {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : null;
};

const specPath = getArg('--spec');
const envPath = getArg('--env');

if (!specPath) {
  console.error('Error: --spec <path> is required');
  process.exit(1);
}

// --- Load env ---
if (envPath) {
  const envFile = fs.readFileSync(envPath, 'utf-8');
  for (const line of envFile.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    process.env[key] = value;
  }
}

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('Error: OPENAI_API_KEY not found. Add it to .env.local or set it in your environment.');
  process.exit(1);
}

// --- Load OpenAI ---
const { default: OpenAI } = await import('openai');
const openai = new OpenAI({ apiKey });

// --- Load spec ---
const spec = JSON.parse(fs.readFileSync(specPath, 'utf-8'));
const iterations = Array.isArray(spec) ? spec : spec.iterations ?? [];

if (iterations.length === 0) {
  console.error('Error: spec contains no iteration entries.');
  process.exit(1);
}

// --- Manifest helpers ---
const MANIFEST_PATH = 'assets/generated/manifest.json';

function loadManifest() {
  if (fs.existsSync(MANIFEST_PATH)) {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  }
  return { assets: [] };
}

function saveManifest(manifest) {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

function addVersionToManifest(manifest, assetId, versionEntry) {
  const entry = manifest.assets.find(a => a.id === assetId);
  if (!entry) {
    console.warn(`Warning: asset '${assetId}' not found in manifest. Adding new entry.`);
    manifest.assets.push({
      id: assetId,
      category: 'unknown',
      label: assetId,
      currentVersion: versionEntry.version,
      approved: false,
      versions: [versionEntry],
    });
    return;
  }
  entry.currentVersion = versionEntry.version;
  entry.approved = false; // reset approval on new version
  entry.versions.push(versionEntry);
}

// --- Generate image ---
async function generateImage(prompt, size, quality, outputPath) {
  const response = await openai.images.generate({
    model: 'gpt-image-1',
    prompt,
    size: size ?? '1024x1024',
    quality: quality ?? 'high',
    output_format: 'png',
  });
  const buffer = Buffer.from(response.data[0].b64_json, 'base64');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, buffer);
}

async function generateImageFromReference(prompt, referencePath, size, quality, outputPath) {
  const refStream = fs.createReadStream(referencePath);
  const response = await openai.images.edit({
    model: 'gpt-image-1',
    image: refStream,
    prompt,
    size: size ?? '1024x1024',
    quality: quality ?? 'high',
  });
  const buffer = Buffer.from(response.data[0].b64_json, 'base64');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, buffer);
}

// --- Version helpers ---
function versionFromPath(outputPath) {
  const filename = path.basename(outputPath, '.png');
  const match = filename.match(/-v(\d+[a-z]?)$/);
  return match ? `v${match[1]}` : 'v?';
}

// --- Process iterations ---
const manifest = loadManifest();
const results = [];

for (const item of iterations) {
  const { mode, assetId } = item;
  console.log(`\n→ Iterating: ${assetId} (mode: ${mode})`);

  try {
    if (mode === 'variations') {
      const { sourcePrompt, count = 3, outputPaths, size, quality } = item;
      const generated = [];

      for (let i = 0; i < count; i++) {
        const outputPath = outputPaths[i];
        if (!outputPath) break;
        console.log(`  Variation ${i + 1}/${count}: ${outputPath}`);
        await generateImage(sourcePrompt, size, quality, outputPath);
        const version = versionFromPath(outputPath);
        addVersionToManifest(manifest, assetId, {
          version,
          path: outputPath,
          prompt: sourcePrompt,
          model: 'gpt-image-1',
          size: size ?? '1024x1024',
          quality: quality ?? 'high',
          referenceImages: [],
          generatedAt: new Date().toISOString(),
          iterationType: 'variation',
        });
        generated.push({ outputPath, success: true });
      }

      results.push({ assetId, mode, generated });

    } else if (mode === 'refinement') {
      const { revisedPrompt, changeLog, outputPath, size, quality } = item;
      console.log(`  Prompt: ${revisedPrompt.slice(0, 80)}...`);
      await generateImage(revisedPrompt, size, quality, outputPath);
      console.log(`  Saved: ${outputPath}`);

      addVersionToManifest(manifest, assetId, {
        version: versionFromPath(outputPath),
        path: outputPath,
        prompt: revisedPrompt,
        model: 'gpt-image-1',
        size: size ?? '1024x1024',
        quality: quality ?? 'high',
        referenceImages: [],
        generatedAt: new Date().toISOString(),
        iterationType: 'refinement',
        changeLog: changeLog ?? '',
      });

      results.push({ assetId, mode, outputPath, success: true });

    } else if (mode === 'reference-guided') {
      const { revisedPrompt, referenceImage, outputPath, size, quality } = item;
      console.log(`  Reference: ${referenceImage}`);
      console.log(`  Prompt: ${revisedPrompt.slice(0, 80)}...`);
      await generateImageFromReference(revisedPrompt, referenceImage, size, quality, outputPath);
      console.log(`  Saved: ${outputPath}`);

      addVersionToManifest(manifest, assetId, {
        version: versionFromPath(outputPath),
        path: outputPath,
        prompt: revisedPrompt,
        model: 'gpt-image-1',
        size: size ?? '1024x1024',
        quality: quality ?? 'high',
        referenceImages: [referenceImage],
        generatedAt: new Date().toISOString(),
        iterationType: 'reference-guided',
      });

      results.push({ assetId, mode, outputPath, success: true });

    } else {
      console.error(`  Unknown mode: ${mode}`);
      results.push({ assetId, mode, success: false, error: `Unknown mode: ${mode}` });
    }

  } catch (err) {
    console.error(`  Error on ${assetId}: ${err.message}`);
    results.push({ assetId, mode, success: false, error: err.message });
  }
}

saveManifest(manifest);

// --- Output JSON result for Claude to parse ---
console.log('\n--- RESULT ---');
console.log(JSON.stringify({ iterated: results, manifestUpdated: true }, null, 2));
