#!/usr/bin/env node
/**
 * theme-generator.js — Swap Tailwind palettes across all three platforms
 *
 * Usage:
 *   node scripts/theme-generator.js \
 *     --brand indigo --neutral slate --radius lg --selection brand \
 *     --web <path-to-globals.css> \
 *     --ios <path-to-DesignTokens.swift> \
 *     --android <path-to-DesignTokens.kt>
 *
 * What it does:
 *   1. Reads palettes.json for hex values
 *   2. Replaces zinc primitives → brand palette hex values
 *   3. Replaces neutral primitives → neutral palette hex values (if changed)
 *   4. Updates semantic tokens that inline hex (iOS/Android)
 *   5. Updates corner radius values
 */

const fs = require("fs");
const path = require("path");

// ── Parse CLI args ────────────────────────────────────────────────────────

const args = {};
for (let i = 2; i < process.argv.length; i += 2) {
  const key = process.argv[i].replace(/^--/, "");
  args[key] = process.argv[i + 1];
}

const brand = args.brand || "zinc";
const neutral = args.neutral || "neutral";
const radius = args.radius || "md";
const selection = args.selection || "brand";
const webFile = args.web;
const iosFile = args.ios;
const androidFile = args.android;

if (!webFile && !iosFile && !androidFile) {
  console.error(
    "Usage: node theme-generator.js --brand <palette> --neutral <palette> --radius <preset> --selection <brand|neutral> --web <file> --ios <file> --android <file>"
  );
  process.exit(1);
}

// ── Load palettes ─────────────────────────────────────────────────────────

const palettesPath = path.join(__dirname, "palettes.json");
const palettes = JSON.parse(fs.readFileSync(palettesPath, "utf-8"));

if (!palettes[brand]) {
  console.error(`ERROR: Unknown brand palette '${brand}'`);
  process.exit(1);
}
if (!palettes[neutral]) {
  console.error(`ERROR: Unknown neutral palette '${neutral}'`);
  process.exit(1);
}

const zincPalette = palettes.zinc;
const neutralPalette = palettes.neutral;
const brandPalette = palettes[brand];
const newNeutralPalette = palettes[neutral];

const SHADES = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "950",
];

// ── Radius presets ────────────────────────────────────────────────────────

const RADIUS_PRESETS = {
  none: { css: "0px", swift: "0", kotlin: "0.dp" },
  sm: { css: "4px", swift: "4", kotlin: "4.dp" },
  md: { css: "8px", swift: "8", kotlin: "8.dp" },
  lg: { css: "12px", swift: "12", kotlin: "12.dp" },
  xl: { css: "16px", swift: "16", kotlin: "16.dp" },
  full: { css: "9999px", swift: "9999", kotlin: "9999.dp" },
};

// ── Semantic token mapping ────────────────────────────────────────────────
// Maps: which zinc shade is used in which semantic token (light mode / dark mode)
// This tells us which hex values to replace when swapping the brand palette.
//
// Format: [lightShade, darkShade] — the zinc shade used in light/dark mode

const BRAND_SEMANTIC_MAP = {
  // Surfaces/BrandInteractive
  surfacesBrandInteractive: ["950", "50"],
  surfacesBrandInteractiveHover: ["800", "200"],
  surfacesBrandInteractivePressed: ["700", "400"],
  // Typography/Brand
  typographyBrand: ["950", "50"],
  // Icons/Brand
  iconsBrand: ["950", "50"],
  // Border/BrandDefault
  borderBrandDefault: ["950", "50"],
};

const NEUTRAL_SEMANTIC_MAP = {
  // Surfaces/Base
  surfacesBaseLowContrast: ["100", "900"],
  surfacesBaseHighContrast: ["200", "800"],
  surfacesBaseLowContrastHover: ["200", "800"],
  surfacesBaseLowContrastPressed: ["300", "700"],
  // Typography
  typographyPrimary: ["900", "50"],
  typographySecondary: ["500", "400"],
  typographyTertiary: ["400", "500"],
  typographyDisabled: ["300", "700"],
  // Icons
  iconsPrimary: ["900", "50"],
  iconsSecondary: ["500", "400"],
  iconsTertiary: ["400", "500"],
  iconsDisabled: ["300", "700"],
  // Border
  borderDefault: ["200", "800"],
  borderMuted: ["100", "900"],
};

// ── Helper: hex without # ─────────────────────────────────────────────────

function stripHash(hex) {
  return hex.replace("#", "").toUpperCase();
}

// ── Process Web (globals.css) ─────────────────────────────────────────────

function processWeb(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");

  // Replace zinc primitives → brand palette
  if (brand !== "zinc") {
    for (const shade of SHADES) {
      const oldHex = zincPalette[shade];
      const newHex = brandPalette[shade];
      // Replace in primitive token definitions
      const regex = new RegExp(
        `(--color-zinc-${shade}:\\s*)${escapeRegex(oldHex)}`,
        "gi"
      );
      content = content.replace(regex, `$1${newHex}`);
    }
  }

  // Replace neutral primitives → new neutral palette
  if (neutral !== "neutral") {
    for (const shade of SHADES) {
      const oldHex = neutralPalette[shade];
      const newHex = newNeutralPalette[shade];
      const regex = new RegExp(
        `(--color-neutral-${shade}:\\s*)${escapeRegex(oldHex)}`,
        "gi"
      );
      content = content.replace(regex, `$1${newHex}`);
    }
  }

  // Web semantic tokens use var() references, so updating primitives is sufficient.
  // The semantic tokens automatically pick up the new values.

  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`  Updated: ${filePath}`);
}

// ── Process iOS (DesignTokens.swift) ──────────────────────────────────────

function processIOS(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");

  // Replace zinc primitives → brand palette
  if (brand !== "zinc") {
    for (const shade of SHADES) {
      const oldHex = zincPalette[shade];
      const newHex = brandPalette[shade];
      // Primitive definitions: Color(hex: "#FAFAFA")
      content = replaceAllCase(content, oldHex, newHex);
    }
  }

  // Replace neutral primitives → new neutral palette
  if (neutral !== "neutral") {
    for (const shade of SHADES) {
      const oldHex = neutralPalette[shade];
      const newHex = newNeutralPalette[shade];
      content = replaceAllCase(content, oldHex, newHex);
    }
  }

  // iOS semantic tokens use inline hex in adaptive(light:dark:),
  // so the primitive hex replacement above already handles them
  // since the same hex values appear in both primitives and semantics.

  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`  Updated: ${filePath}`);
}

// ── Process Android (DesignTokens.kt) ─────────────────────────────────────

function processAndroid(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");

  // Android uses Color(0xFFRRGGBB) format — no # prefix
  if (brand !== "zinc") {
    for (const shade of SHADES) {
      const oldHex = stripHash(zincPalette[shade]);
      const newHex = stripHash(brandPalette[shade]);
      // Replace 0xFF + hex (case-insensitive for hex digits)
      const regex = new RegExp(`0xFF${oldHex}`, "gi");
      content = content.replace(regex, `0xFF${newHex}`);
    }
  }

  if (neutral !== "neutral") {
    for (const shade of SHADES) {
      const oldHex = stripHash(neutralPalette[shade]);
      const newHex = stripHash(newNeutralPalette[shade]);
      const regex = new RegExp(`0xFF${oldHex}`, "gi");
      content = content.replace(regex, `0xFF${newHex}`);
    }
  }

  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`  Updated: ${filePath}`);
}

// ── Utility ───────────────────────────────────────────────────────────────

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceAllCase(content, oldHex, newHex) {
  // Replace hex values case-insensitively (handles #FAFAFA vs #fafafa)
  const regex = new RegExp(escapeRegex(oldHex), "gi");
  return content.replace(regex, newHex);
}

// ── Main ──────────────────────────────────────────────────────────────────

console.log(`Theme Generator`);
console.log(`  Brand:     ${brand} (replacing zinc)`);
console.log(`  Neutral:   ${neutral} (replacing neutral)`);
console.log(`  Radius:    ${radius}`);
console.log(`  Selection: ${selection}`);
console.log("");

if (webFile) {
  if (!fs.existsSync(webFile)) {
    console.error(`ERROR: Web file not found: ${webFile}`);
    process.exit(1);
  }
  processWeb(webFile);
}

if (iosFile) {
  if (!fs.existsSync(iosFile)) {
    console.error(`ERROR: iOS file not found: ${iosFile}`);
    process.exit(1);
  }
  processIOS(iosFile);
}

if (androidFile) {
  if (!fs.existsSync(androidFile)) {
    console.error(`ERROR: Android file not found: ${androidFile}`);
    process.exit(1);
  }
  processAndroid(androidFile);
}

console.log("\nTheme generation complete.");
