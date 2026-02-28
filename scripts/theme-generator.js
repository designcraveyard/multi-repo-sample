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
 *   4. For bright brand palettes, remaps semantic tokens to use accessible shades
 *      (e.g., 600 primary instead of 950) with proper OnBrandPrimary contrast
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

// ── Bright vs Dark palette classification ─────────────────────────────────
// Dark/neutral palettes: brand primary uses 950 (nearly black) — high contrast by default.
// Bright/saturated palettes: brand primary should use 600 for vibrant, accessible color.

const DARK_PALETTES = new Set([
  "zinc",
  "slate",
  "gray",
  "neutral",
  "stone",
]);
const isBrightBrand = !DARK_PALETTES.has(brand);

// ── Radius presets ────────────────────────────────────────────────────────

const RADIUS_PRESETS = {
  none: { css: "0px", swift: "0", kotlin: "0.dp" },
  sm: { css: "4px", swift: "4", kotlin: "4.dp" },
  md: { css: "8px", swift: "8", kotlin: "8.dp" },
  lg: { css: "12px", swift: "12", kotlin: "12.dp" },
  xl: { css: "16px", swift: "16", kotlin: "16.dp" },
  full: { css: "9999px", swift: "9999", kotlin: "9999.dp" },
};

// ── Semantic token shade mapping ──────────────────────────────────────────
// Format: [lightShade, darkShade] — which zinc shade maps to this semantic token.
//
// DARK brands use the original mapping (high shade = dark color).
// BRIGHT brands remap to vibrant mid-range shades for accessibility.

// Dark brand mapping (zinc, slate, gray, neutral, stone)
const DARK_BRAND_MAP = {
  surfacesBrandInteractive:                    ["950", "50"],
  surfacesBrandInteractiveHover:               ["800", "200"],
  surfacesBrandInteractivePressed:             ["700", "400"],
  surfacesBrandInteractiveLowContrast:         ["200", "800"],
  surfacesBrandInteractiveLowContrastHover:    ["300", "700"],
  surfacesBrandInteractiveLowContrastPressed:  ["400", "600"],
  surfacesBrandInteractiveHighContrast:        ["300", "700"],
  surfacesBrandInteractiveHighContrastHover:   ["400", "600"],
  surfacesBrandInteractiveHighContrastPressed: ["500", "500"],
  typographyBrand:                             ["950", "50"],
  typographyOnBrandPrimary:                    null, // white/black — no remap
  iconsBrand:                                  ["950", "50"],
  iconsOnBrandPrimary:                         null, // near-white/near-black — no remap
  borderBrand:                                 ["950", "50"],
};

// Bright brand mapping (all saturated colors)
// Primary = 600 (accessible on white), hover = 700, pressed = 800
// Dark mode: 400 (vibrant on dark bg), hover = 300, pressed = 200
const BRIGHT_BRAND_MAP = {
  surfacesBrandInteractive:                    ["600", "400"],
  surfacesBrandInteractiveHover:               ["700", "300"],
  surfacesBrandInteractivePressed:             ["800", "200"],
  surfacesBrandInteractiveLowContrast:         ["100", "900"],
  surfacesBrandInteractiveLowContrastHover:    ["200", "800"],
  surfacesBrandInteractiveLowContrastPressed:  ["300", "700"],
  surfacesBrandInteractiveHighContrast:        ["200", "800"],
  surfacesBrandInteractiveHighContrastHover:   ["300", "700"],
  surfacesBrandInteractiveHighContrastPressed: ["400", "600"],
  typographyBrand:                             ["600", "400"],
  typographyOnBrandPrimary:                    null, // stays white/black for contrast
  iconsBrand:                                  ["600", "400"],
  iconsOnBrandPrimary:                         null, // stays as-is
  borderBrand:                                 ["600", "400"],
};

const BRAND_SEMANTIC_MAP = isBrightBrand ? BRIGHT_BRAND_MAP : DARK_BRAND_MAP;

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

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceAllCase(content, oldHex, newHex) {
  const regex = new RegExp(escapeRegex(oldHex), "gi");
  return content.replace(regex, newHex);
}

// ── Semantic remap for bright brands (iOS/Android) ────────────────────────
// After the 1:1 primitive swap, the semantic tokens have the WRONG shade.
// e.g., surfacesBrandInteractive has amber-950 but should have amber-600.
// This pass fixes those mismatches.

function buildSemanticFixups() {
  if (!isBrightBrand) return [];

  const fixups = [];
  // The original template uses DARK_BRAND_MAP shades. After the 1:1 swap,
  // those shades now hold brand palette hex values. We need to swap them
  // to the BRIGHT_BRAND_MAP shades.
  for (const [token, brightShades] of Object.entries(BRIGHT_BRAND_MAP)) {
    if (!brightShades) continue; // skip null entries (OnBrand stays as-is)
    const darkShades = DARK_BRAND_MAP[token];
    if (!darkShades) continue;

    const [brightLight, brightDark] = brightShades;
    const [darkLight, darkDark] = darkShades;

    // Light mode: after swap, semantic has brandPalette[darkLight], should be brandPalette[brightLight]
    if (darkLight !== brightLight) {
      fixups.push({
        token,
        mode: "light",
        from: brandPalette[darkLight],
        to: brandPalette[brightLight],
      });
    }
    // Dark mode: after swap, semantic has brandPalette[darkDark], should be brandPalette[brightDark]
    if (darkDark !== brightDark) {
      fixups.push({
        token,
        mode: "dark",
        from: brandPalette[darkDark],
        to: brandPalette[brightDark],
      });
    }
  }
  return fixups;
}

// ── Process Web (globals.css) ─────────────────────────────────────────────

function processWeb(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");

  // Step 1: Replace zinc primitives → brand palette hex values
  if (brand !== "zinc") {
    for (const shade of SHADES) {
      const oldHex = zincPalette[shade];
      const newHex = brandPalette[shade];
      const regex = new RegExp(
        `(--color-zinc-${shade}:\\s*)${escapeRegex(oldHex)}`,
        "gi"
      );
      content = content.replace(regex, `$1${newHex}`);
    }
  }

  // Step 2: Replace neutral primitives → new neutral palette
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

  // Step 3: For bright brands, remap semantic token CSS var references.
  // e.g., --surfaces-brand-interactive: var(--color-zinc-950) → var(--color-zinc-600)
  if (isBrightBrand) {
    console.log("  Remapping brand semantic tokens for bright palette...");
    for (const [token, brightShades] of Object.entries(BRIGHT_BRAND_MAP)) {
      if (!brightShades) continue;
      const darkShades = DARK_BRAND_MAP[token];
      if (!darkShades) continue;

      const [brightLight, brightDark] = brightShades;
      const [darkLight, darkDark] = darkShades;

      // Convert camelCase token to kebab-case CSS custom property
      const cssToken = token.replace(/([A-Z])/g, "-$1").toLowerCase();

      // Light mode references (in @media (prefers-color-scheme: light) or root)
      if (darkLight !== brightLight) {
        const oldRef = `var(--color-zinc-${darkLight})`;
        const newRef = `var(--color-zinc-${brightLight})`;
        // Match the specific semantic token line
        const regex = new RegExp(
          `(--${cssToken}:\\s*)${escapeRegex(oldRef)}`,
          "g"
        );
        content = content.replace(regex, `$1${newRef}`);
      }

      // Dark mode references
      if (darkDark !== brightDark) {
        const oldRef = `var(--color-zinc-${darkDark})`;
        const newRef = `var(--color-zinc-${brightDark})`;
        const regex = new RegExp(
          `(--${cssToken}:\\s*)${escapeRegex(oldRef)}`,
          "g"
        );
        content = content.replace(regex, `$1${newRef}`);
      }
    }
  }

  // Step 4: Apply radius preset — update the shadcn `--radius` base variable.
  // The design system tokens (--radius-xs, --radius-sm, etc.) are Figma-defined
  // fixed values and stay unchanged. Only the shadcn base `--radius` variable is
  // swapped to reflect the chosen corner style.
  const radiusPreset = RADIUS_PRESETS[radius];
  if (radiusPreset) {
    content = content.replace(
      /(--radius:\s*)[\d.]+(?:rem|px|em)/,
      `$1${radiusPreset.css}`
    );
  }

  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`  Updated: ${filePath}`);
}

// ── Process iOS (DesignTokens.swift) ──────────────────────────────────────

function processIOS(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");

  // Step 1: Replace zinc primitives → brand palette (1:1 shade swap)
  if (brand !== "zinc") {
    for (const shade of SHADES) {
      const oldHex = zincPalette[shade];
      const newHex = brandPalette[shade];
      content = replaceAllCase(content, oldHex, newHex);
    }
  }

  // Step 2: Replace neutral primitives → new neutral palette
  if (neutral !== "neutral") {
    for (const shade of SHADES) {
      const oldHex = neutralPalette[shade];
      const newHex = newNeutralPalette[shade];
      content = replaceAllCase(content, oldHex, newHex);
    }
  }

  // Step 3: For bright brands, fix semantic token hex values.
  // After step 1, semantic tokens have brandPalette[darkShade] but need brandPalette[brightShade].
  // We do targeted line-by-line replacement to avoid affecting primitives.
  const fixups = buildSemanticFixups();
  if (fixups.length > 0) {
    console.log(
      `  Applying ${fixups.length} semantic fixups for bright brand...`
    );
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      for (const fixup of fixups) {
        // Match lines containing the semantic token name
        if (lines[i].includes(fixup.token)) {
          // For light mode fixups, replace in the light: part (first hex in adaptive)
          // For dark mode fixups, replace in the dark: part (second hex in adaptive)
          // Swift format: adaptive(light: "#HEX1", dark: "#HEX2")
          if (fixup.mode === "light") {
            // Replace first occurrence of the hex on this line
            lines[i] = lines[i].replace(
              new RegExp(escapeRegex(fixup.from), "i"),
              fixup.to
            );
          } else {
            // Replace last occurrence (dark mode) — reverse, replace first, reverse back
            const reversed = lines[i].split("").reverse().join("");
            const fromReversed = fixup.from.split("").reverse().join("");
            const toReversed = fixup.to.split("").reverse().join("");
            const fixedReversed = reversed.replace(
              new RegExp(escapeRegex(fromReversed), "i"),
              toReversed
            );
            lines[i] = fixedReversed.split("").reverse().join("");
          }
        }
      }
    }
    content = lines.join("\n");
  }

  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`  Updated: ${filePath}`);
}

// ── Process Android (DesignTokens.kt) ─────────────────────────────────────

function processAndroid(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");

  // Step 1: Replace zinc primitives → brand palette (Android: 0xFFRRGGBB)
  if (brand !== "zinc") {
    for (const shade of SHADES) {
      const oldHex = stripHash(zincPalette[shade]);
      const newHex = stripHash(brandPalette[shade]);
      const regex = new RegExp(`0xFF${oldHex}`, "gi");
      content = content.replace(regex, `0xFF${newHex}`);
    }
  }

  // Step 2: Replace neutral primitives
  if (neutral !== "neutral") {
    for (const shade of SHADES) {
      const oldHex = stripHash(neutralPalette[shade]);
      const newHex = stripHash(newNeutralPalette[shade]);
      const regex = new RegExp(`0xFF${oldHex}`, "gi");
      content = content.replace(regex, `0xFF${newHex}`);
    }
  }

  // Step 3: Semantic fixups for bright brands (same logic as iOS but 0xFF format)
  const fixups = buildSemanticFixups();
  if (fixups.length > 0) {
    console.log(
      `  Applying ${fixups.length} semantic fixups for bright brand...`
    );
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      for (const fixup of fixups) {
        if (lines[i].includes(fixup.token)) {
          const fromHex = stripHash(fixup.from);
          const toHex = stripHash(fixup.to);
          if (fixup.mode === "light") {
            lines[i] = lines[i].replace(
              new RegExp(`0xFF${fromHex}`, "i"),
              `0xFF${toHex}`
            );
          } else {
            // Replace last occurrence for dark mode
            const reversed = lines[i].split("").reverse().join("");
            const fromReversed = `FF0x${fromHex.split("").reverse().join("")}`;
            const toReversed = `FF0x${toHex.split("").reverse().join("")}`;
            // Actually, simpler approach: find all occurrences, replace the last one
            const regex = new RegExp(`0xFF${fromHex}`, "gi");
            const matches = [...lines[i].matchAll(regex)];
            if (matches.length >= 2) {
              const lastMatch = matches[matches.length - 1];
              lines[i] =
                lines[i].substring(0, lastMatch.index) +
                `0xFF${toHex}` +
                lines[i].substring(lastMatch.index + lastMatch[0].length);
            }
          }
        }
      }
    }
    content = lines.join("\n");
  }

  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`  Updated: ${filePath}`);
}

// ── Main ──────────────────────────────────────────────────────────────────

console.log(`Theme Generator`);
console.log(`  Brand:     ${brand} (replacing zinc)${isBrightBrand ? " [BRIGHT — using 600/400 ramp]" : " [DARK — using 950/50 ramp]"}`);
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
