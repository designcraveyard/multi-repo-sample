#!/usr/bin/env node
/**
 * asset-gen/generate.js
 *
 * Generates visual assets from a JSON spec using OpenAI gpt-image-1.
 * Called by Claude via Bash tool during /asset-gen skill execution.
 *
 * Usage:
 *   node generate.js --spec /tmp/asset-gen-spec.json --env .env.local
 *
 * Spec format (array of asset entries):
 * [
 *   {
 *     "id": "empty-state-notes",
 *     "category": "empty-states",
 *     "label": "Empty State — Notes Screen",
 *     "size": "1024x1024",
 *     "quality": "high",
 *     "outputPath": "assets/generated/empty-states/empty-state-notes-v1.png",
 *     "prompt": "...",
 *     "referenceImages": [],       // optional: local file paths for image-to-image
 *     "referenceWeight": 0.6       // optional: 0.0–1.0, strength of reference influence
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
const assets = Array.isArray(spec) ? spec : spec.assets ?? [];

if (assets.length === 0) {
  console.error('Error: spec contains no assets to generate.');
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
  fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

function upsertManifestEntry(manifest, asset, versionEntry) {
  let entry = manifest.assets.find(a => a.id === asset.id);
  if (!entry) {
    entry = {
      id: asset.id,
      category: asset.category,
      label: asset.label,
      currentVersion: versionEntry.version,
      approved: false,
      versions: [],
    };
    manifest.assets.push(entry);
  }
  entry.currentVersion = versionEntry.version;
  entry.versions.push(versionEntry);
}

// --- Generate one asset ---
async function generateAsset(asset) {
  const { id, label, size, quality, outputPath, prompt, referenceImages = [] } = asset;

  console.log(`\n→ Generating: ${label}`);
  console.log(`  Prompt: ${prompt.slice(0, 80)}...`);

  // Ensure output directory exists
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  let imageData;

  if (referenceImages.length > 0) {
    // Image-to-image: use images.edit with reference
    console.log(`  Mode: image-to-image (${referenceImages.length} reference(s))`);

    // Build form data with reference images
    const refImage = fs.createReadStream(referenceImages[0]);

    const response = await openai.images.edit({
      model: 'gpt-image-1',
      image: refImage,
      prompt,
      size,
      quality: quality ?? 'high',
    });

    imageData = response.data[0].b64_json;
  } else {
    // Text-to-image
    console.log(`  Mode: text-to-image`);

    const response = await openai.images.generate({
      model: 'gpt-image-1',
      prompt,
      size,
      quality: quality ?? 'high',
      output_format: 'png',
    });

    imageData = response.data[0].b64_json;
  }

  // Save the image
  const buffer = Buffer.from(imageData, 'base64');
  fs.writeFileSync(outputPath, buffer);
  console.log(`  Saved: ${outputPath}`);

  return {
    id,
    outputPath,
    success: true,
  };
}

// --- Main ---
const manifest = loadManifest();
const results = [];

for (const asset of assets) {
  try {
    const result = await generateAsset(asset);
    results.push(result);

    // Determine version number from outputPath filename
    const filename = path.basename(asset.outputPath, '.png');
    const versionMatch = filename.match(/-v(\d+[a-z]?)$/);
    const version = versionMatch ? `v${versionMatch[1]}` : 'v1';

    upsertManifestEntry(manifest, asset, {
      version,
      path: asset.outputPath,
      prompt: asset.prompt,
      model: 'gpt-image-1',
      size: asset.size,
      quality: asset.quality ?? 'high',
      referenceImages: asset.referenceImages ?? [],
      generatedAt: new Date().toISOString(),
      iterationType: 'initial',
    });
  } catch (err) {
    console.error(`  Error generating ${asset.id}: ${err.message}`);
    results.push({ id: asset.id, outputPath: asset.outputPath, success: false, error: err.message });
  }
}

saveManifest(manifest);

// --- Output JSON result for Claude to parse ---
console.log('\n--- RESULT ---');
console.log(JSON.stringify({ generated: results, manifestUpdated: true }, null, 2));
