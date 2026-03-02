import type { LayerNode, FigmaColorWithAlpha } from './types';
import { parseCssColor } from '../utils/color';
import {
  parsePx,
  detectLayoutMode,
  mapJustifyContent,
  mapAlignItems,
  mapTextAlign,
  parseBoxShadow,
} from './css-utils';

// --- Tag classification ---

const SKIP_TAGS = new Set([
  'SCRIPT', 'STYLE', 'NOSCRIPT', 'META', 'LINK', 'HEAD', 'BR', 'WBR',
  'TEMPLATE', 'IFRAME', 'OBJECT', 'EMBED',
]);

// SVG child elements — part of their parent SVG and should never be walked as standalone nodes
const SVG_CHILD_TAGS = new Set([
  'PATH', 'RECT', 'CIRCLE', 'ELLIPSE', 'LINE', 'POLYLINE', 'POLYGON',
  'TEXT', 'TSPAN', 'G', 'DEFS', 'CLIPPATH', 'MASK', 'USE', 'SYMBOL',
  'LINEARGRADIENT', 'RADIALGRADIENT', 'STOP', 'PATTERN', 'FILTER',
  'FEGAUSSIANBLUR', 'FEOFFSET', 'FEBLEND', 'FECOLORMATRIX',
  'FOREIGNOBJECT', 'IMAGE', 'ANIMATE', 'ANIMATETRANSFORM',
]);

const TEXT_TAGS = new Set([
  'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SPAN', 'A', 'LABEL',
  'STRONG', 'EM', 'B', 'I', 'U', 'S', 'CODE', 'PRE', 'BLOCKQUOTE',
  'SMALL', 'SUB', 'SUP', 'MARK', 'DEL', 'INS', 'ABBR', 'CITE', 'Q',
  'TIME', 'KBD', 'SAMP', 'VAR',
]);

const RECT_TAGS = new Set(['IMG', 'HR', 'VIDEO', 'CANVAS', 'AUDIO']);
const SVG_TAG = 'SVG';

// --- Icon font detection and SVG fetching ---

interface IconMatch {
  name: string;
  weight: string; // regular, fill, bold, thin, light, duotone
  svgUrl: string;
}

/** Phosphor Icons: <i class="ph ph-house"></i> or <i class="ph-fill ph-house"></i> */
function matchPhosphor(classes: string[]): IconMatch | null {
  const WEIGHTS = ['ph-fill', 'ph-thin', 'ph-light', 'ph-bold', 'ph-duotone'];
  const weightClass = classes.find(c => WEIGHTS.includes(c));
  const nameClass = classes.find(c => c.startsWith('ph-') && !WEIGHTS.includes(c));
  if (!nameClass) return null;
  const name = nameClass.replace('ph-', '');
  const weight = weightClass ? weightClass.replace('ph-', '') : 'regular';
  // Non-regular weights use a "-{weight}" suffix in the filename:
  // regular: house.svg, fill: house-fill.svg, bold: house-bold.svg, etc.
  const filename = weight === 'regular' ? `${name}.svg` : `${name}-${weight}.svg`;
  return {
    name,
    weight,
    svgUrl: `https://unpkg.com/@phosphor-icons/core/assets/${weight}/${filename}`,
  };
}

/**
 * Phosphor web components: <ph-house></ph-house> or <ph-house weight="fill"></ph-house>
 * The tag name is the icon name prefixed with "ph-".
 */
function matchPhosphorWebComponent(el: HTMLElement): IconMatch | null {
  const tag = el.tagName.toLowerCase();
  if (!tag.startsWith('ph-')) return null;
  const name = tag.slice(3); // strip "ph-"
  if (!name) return null;
  const weight = (el.getAttribute('weight') || 'regular').toLowerCase();
  const filename = weight === 'regular' ? `${name}.svg` : `${name}-${weight}.svg`;
  return {
    name,
    weight,
    svgUrl: `https://unpkg.com/@phosphor-icons/core/assets/${weight}/${filename}`,
  };
}

/** Font Awesome: <i class="fas fa-home"></i> or <i class="fa-solid fa-home"></i> */
function matchFontAwesome(classes: string[]): IconMatch | null {
  let variant = 'solid';
  if (classes.includes('far') || classes.includes('fa-regular')) variant = 'regular';
  if (classes.includes('fab') || classes.includes('fa-brands')) variant = 'brands';
  if (classes.includes('fal') || classes.includes('fa-light')) variant = 'light';
  const nameClass = classes.find(c =>
    c.startsWith('fa-') && !['fa-solid', 'fa-regular', 'fa-brands', 'fa-light', 'fa-duotone', 'fa-thin'].includes(c)
  );
  if (!nameClass) return null;
  const name = nameClass.replace('fa-', '');
  return {
    name,
    weight: variant,
    svgUrl: `https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/${variant}/${name}.svg`,
  };
}

/** Bootstrap Icons: <i class="bi bi-house"></i> */
function matchBootstrapIcons(classes: string[]): IconMatch | null {
  const nameClass = classes.find(c => c.startsWith('bi-'));
  if (!nameClass) return null;
  const name = nameClass.replace('bi-', '');
  return {
    name,
    weight: 'regular',
    svgUrl: `https://unpkg.com/bootstrap-icons/icons/${name}.svg`,
  };
}

/** Material Symbols / Icons: <span class="material-symbols-outlined">home</span> */
function matchMaterialIcons(classes: string[], textContent?: string): IconMatch | null {
  const isMaterial = classes.some(c => c.startsWith('material-icons') || c.startsWith('material-symbols'));
  if (!isMaterial) return null;
  const name = textContent?.trim().replace(/_/g, '-');
  if (!name) return null;
  const variant = classes.includes('material-symbols-rounded') ? 'rounded'
    : classes.includes('material-symbols-sharp') ? 'sharp'
    : 'outlined';
  return {
    name,
    weight: variant,
    svgUrl: `https://unpkg.com/@material-design-icons/svg/${variant}/${name.replace(/-/g, '_')}.svg`,
  };
}

/** Detect an icon font element and return its SVG URL. */
function detectIconFont(el: HTMLElement): IconMatch | null {
  // Phosphor web components: <ph-house>, <ph-waveform weight="fill">, etc.
  if (el.tagName.toLowerCase().startsWith('ph-')) {
    return matchPhosphorWebComponent(el);
  }

  const classes = Array.from(el.classList);

  // Phosphor CSS classes
  if (classes.some(c => c === 'ph' || c.startsWith('ph-'))) {
    return matchPhosphor(classes);
  }
  // Font Awesome
  if (classes.some(c => c === 'fa' || c === 'fas' || c === 'far' || c === 'fab' || c === 'fal' || c.startsWith('fa-'))) {
    return matchFontAwesome(classes);
  }
  // Bootstrap Icons
  if (classes.some(c => c === 'bi' || c.startsWith('bi-'))) {
    return matchBootstrapIcons(classes);
  }
  // Material Icons/Symbols
  if (classes.some(c => c.startsWith('material-icons') || c.startsWith('material-symbols'))) {
    return matchMaterialIcons(classes, el.textContent || undefined);
  }

  // ::before / ::after pseudo-element with content: url("icon.svg")
  // Covers any CSS library that injects SVG icons via pseudo-elements.
  for (const pseudo of ['::before', '::after'] as const) {
    const content = window.getComputedStyle(el, pseudo).content;
    if (!content || content === 'none' || content === '""' || content === "''") continue;
    const urlMatch = content.match(/url\(["']?([^"')]+)["']?\)/i);
    if (urlMatch && isSvgSrc(urlMatch[1])) {
      return { name: el.title || el.className || 'icon', weight: 'regular', svgUrl: urlMatch[1] };
    }
  }

  // Generic fallback: any element whose computed font-family looks like an icon font.
  // We can't know the CDN URL, so svgUrl is empty → placeholder with correct size/color.
  const ICON_FONT_KEYWORDS = [
    'icon', 'symbol', 'glyph', 'awesome', 'ionicon', 'icomoon', 'themify',
    'feather', 'remix', 'tabler', 'heroicon', 'lucide', 'eva', 'devicon',
    'dashicon', 'glyphicon', 'octicon',
  ];
  const fontFamily = window.getComputedStyle(el).fontFamily.toLowerCase();
  if (ICON_FONT_KEYWORDS.some(kw => fontFamily.includes(kw))) {
    return { name: el.textContent?.trim() || 'icon', weight: 'regular', svgUrl: '' };
  }

  return null;
}

// --- Public API ---

/**
 * Parse an HTML string into a LayerNode tree.
 * Fetches external CSS and replaces icon font elements with inline SVGs.
 * Handles both fragments (`<div>...</div>`) and full documents (`<!DOCTYPE html>...`).
 */
export async function parseHtml(html: string, viewportWidth = 1440): Promise<LayerNode> {
  // Fetch external CSS and inline it
  const processedHtml = await preprocessHtml(html);

  const container = document.createElement('div');
  // Off-screen but fully laid out at the specified viewport width
  container.style.cssText =
    `position:fixed;left:-9999px;top:0;width:${viewportWidth}px;height:auto;overflow:hidden;pointer-events:none;`;
  document.body.appendChild(container);

  container.innerHTML = processedHtml;

  // Force layout computation
  void container.offsetHeight;

  // Replace icon font elements with inline SVGs
  await replaceIconFontElements(container);

  // Re-force layout after SVG replacement
  void container.offsetHeight;

  // Find a meaningful root element (skip meta, link, style, script, etc.)
  const rootElement = findContentRoot(container);
  console.log('[h2f-parser] Walking DOM tree, root:', rootElement.tagName, rootElement.className);
  const tree = walkElement(rootElement, null, 'NONE');

  console.log('[h2f-parser] Tree built:', {
    type: tree.type,
    name: tree.name,
    size: `${tree.width}x${tree.height}`,
    layout: tree.layoutMode,
    wrap: tree.layoutWrap,
    children: tree.children.length,
  });
  logTreeSummary(tree, 0);

  document.body.removeChild(container);
  return tree;
}

// --- External CSS Fetching ---

/**
 * Fetch external stylesheets from <link> tags and inline them.
 * Also handles full HTML documents.
 */
async function preprocessHtml(html: string): Promise<string> {
  const trimmed = html.trim();
  const isFullDocument =
    trimmed.startsWith('<!') ||
    trimmed.toLowerCase().startsWith('<html') ||
    /^<head[\s>]/i.test(trimmed);

  if (!isFullDocument) {
    // Even fragments may contain <link> tags — try to fetch them
    return await inlineExternalCss(html);
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Collect all <style> tags from <head>
  const styles: string[] = [];
  doc.querySelectorAll('head style').forEach((s) => {
    styles.push(s.outerHTML);
  });

  // Fetch external stylesheets from <link> tags
  const fetchPromises: Promise<string>[] = [];
  doc.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
    const href = link.getAttribute('href');
    if (href) {
      fetchPromises.push(
        fetchCssContent(href).then((css) =>
          css ? `<style>/* Fetched: ${href} */\n${css}</style>` : ''
        )
      );
    }
  });

  const fetchedStyles = await Promise.all(fetchPromises);
  styles.push(...fetchedStyles.filter(Boolean));

  // Get the body innerHTML
  const bodyHtml = doc.body ? doc.body.innerHTML : html;

  // Combine styles + body content
  return styles.join('\n') + '\n' + bodyHtml;
}

/**
 * For HTML fragments, find and replace <link rel="stylesheet"> with inline <style>.
 */
async function inlineExternalCss(html: string): Promise<string> {
  const linkRegex = /<link\s+[^>]*rel\s*=\s*["']stylesheet["'][^>]*>/gi;
  const links = html.match(linkRegex);
  if (!links || links.length === 0) return html;

  let result = html;
  for (const linkTag of links) {
    const hrefMatch = linkTag.match(/href\s*=\s*["']([^"']+)["']/);
    if (!hrefMatch) continue;
    const href = hrefMatch[1];
    const css = await fetchCssContent(href);
    if (css) {
      result = result.replace(linkTag, `<style>/* Fetched: ${href} */\n${css}</style>`);
    }
  }
  return result;
}

/**
 * Fetch CSS content from a URL. Returns null on failure.
 * Only fetches absolute URLs (http/https). Relative URLs are skipped.
 */
async function fetchCssContent(href: string): Promise<string | null> {
  // Only fetch absolute URLs
  if (!href.startsWith('http://') && !href.startsWith('https://')) {
    return null;
  }
  try {
    const response = await fetch(href);
    if (!response.ok) return null;
    let css = await response.text();

    // Recursively fetch @import URLs inside the CSS
    css = await resolveAtImports(css, href);

    return css;
  } catch {
    return null;
  }
}

/**
 * Resolve @import url(...) directives inside CSS by fetching and inlining them.
 */
async function resolveAtImports(css: string, baseUrl: string): Promise<string> {
  const importRegex = /@import\s+(?:url\()?["']?([^"')]+)["']?\)?[^;]*;/gi;
  const imports = [...css.matchAll(importRegex)];
  if (imports.length === 0) return css;

  let result = css;
  for (const match of imports) {
    const importUrl = resolveUrl(match[1], baseUrl);
    if (!importUrl) continue;
    try {
      const response = await fetch(importUrl);
      if (response.ok) {
        const importedCss = await response.text();
        result = result.replace(match[0], `/* @import ${importUrl} */\n${importedCss}`);
      }
    } catch {
      // Skip failed imports
    }
  }
  return result;
}

/** Resolve a relative URL against a base URL. */
function resolveUrl(relative: string, base: string): string | null {
  try {
    return new URL(relative, base).href;
  } catch {
    return null;
  }
}

// --- SVG / Icon Utilities ---

/** True if a src/href points to an SVG (URL or data URI). */
function isSvgSrc(src: string): boolean {
  if (!src) return false;
  if (src.startsWith('data:image/svg+xml')) return true;
  const clean = src.split('?')[0].split('#')[0].toLowerCase();
  return clean.endsWith('.svg');
}

/**
 * Fetch or decode an SVG from a URL, relative path, or data URI.
 * Returns the raw SVG text, or null on failure.
 */
async function fetchSvgContent(src: string): Promise<string | null> {
  if (src.startsWith('data:image/svg+xml,')) {
    try { return decodeURIComponent(src.slice('data:image/svg+xml,'.length)); } catch { return null; }
  }
  if (src.startsWith('data:image/svg+xml;base64,')) {
    try { return atob(src.slice('data:image/svg+xml;base64,'.length)); } catch { return null; }
  }
  if (!src.startsWith('http://') && !src.startsWith('https://') && !src.startsWith('/')) return null;
  try {
    const res = await fetch(src);
    if (!res.ok) return null;
    const text = await res.text();
    return text.includes('<svg') ? text : null;
  } catch {
    return null;
  }
}

/**
 * Extract an SVG string from a CSS background-image data URI.
 * Only handles data URIs (synchronous — no network fetch needed).
 */
function extractBgSvgDataUri(bgImage: string): string | null {
  if (!bgImage || bgImage === 'none') return null;
  const match = bgImage.match(/url\(["']?(data:image\/svg\+xml[^"')]+)["']?\)/i);
  if (!match) return null;
  const dataUri = match[1];
  try {
    if (dataUri.includes(';base64,')) return atob(dataUri.split(';base64,')[1]);
    if (dataUri.includes(',')) return decodeURIComponent(dataUri.split(',').slice(1).join(','));
  } catch { /* ignore decode errors */ }
  return null;
}

/** Stamp a correctly-sized/colored placeholder onto an element we can't vectorize. */
function applyIconPlaceholder(el: HTMLElement, name: string): void {
  const cs = window.getComputedStyle(el);
  const size = parsePx(cs.fontSize) || parsePx(cs.width) || parsePx(cs.height) || 24;
  el.style.display = 'inline-block';
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  el.style.borderRadius = `${Math.round(size / 6)}px`;
  el.style.backgroundColor = cs.color || '#71717a';
  el.style.flexShrink = '0';
  el.title = `icon: ${name}`;
}

/** Stamp a fetched SVG string onto an element, preserving computed size and color. */
function applySvgToElement(el: HTMLElement, svgText: string): void {
  const cs = window.getComputedStyle(el);
  const size = parsePx(cs.fontSize) || parsePx(cs.width) || parsePx(cs.height) || 24;
  const color = cs.color || 'currentColor';

  const wrapper = document.createElement('div');
  wrapper.innerHTML = svgText;
  const svgEl = wrapper.querySelector('svg');
  if (!svgEl || !el.parentNode) return;

  svgEl.setAttribute('width', String(size));
  svgEl.setAttribute('height', String(size));
  svgEl.setAttribute('fill', color);
  if (!svgEl.getAttribute('xmlns')) svgEl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  el.parentNode.replaceChild(svgEl, el);
}

// --- Icon Font Replacement ---

/**
 * Three-pass SVG normalisation:
 *   1. Icon font elements → fetch SVG from CDN and inline
 *   2. <img src="*.svg"> → fetch SVG and inline
 *   3. Anything else we couldn't resolve → size/color-accurate placeholder
 */
async function replaceIconFontElements(container: HTMLElement): Promise<void> {
  // --- Pass 1: Icon font elements (CSS classes + web components) ---
  const iconElements: Array<{ el: HTMLElement; match: IconMatch }> = [];
  container.querySelectorAll('*').forEach((el) => {
    const match = detectIconFont(el as HTMLElement);
    if (match) iconElements.push({ el: el as HTMLElement, match });
  });

  // Icons with an empty svgUrl can't be fetched — apply placeholder immediately
  for (const { el, match } of iconElements.filter(({ match }) => !match.svgUrl)) {
    applyIconPlaceholder(el, match.name);
  }

  // Fetch unique URLs in batches of 20
  const fetchable = iconElements.filter(({ match }) => !!match.svgUrl);
  const svgCache = new Map<string, string | null>();
  const uniqueUrls = [...new Set(fetchable.map(({ match }) => match.svgUrl))];
  const BATCH = 20;
  for (let i = 0; i < uniqueUrls.length; i += BATCH) {
    const results = await Promise.all(
      uniqueUrls.slice(i, i + BATCH).map(async (url) => {
        try {
          const res = await fetch(url);
          if (!res.ok) return { url, svg: null };
          const text = await res.text();
          return { url, svg: text.includes('<svg') ? text : null };
        } catch {
          return { url, svg: null };
        }
      })
    );
    results.forEach(({ url, svg }) => svgCache.set(url, svg));
  }

  for (const { el, match } of fetchable) {
    const svg = svgCache.get(match.svgUrl);
    if (svg) applySvgToElement(el, svg);
    else applyIconPlaceholder(el, match.name);
  }

  // --- Pass 2: Inline <img src="*.svg"> as real vector nodes ---
  await inlineSvgImgTags(container);

  // --- Pass 3: Elements with background-image SVG URLs (not data URIs) ---
  // Data URIs are handled synchronously in walkElement; URL-based SVGs need a fetch.
  await fetchAndStoreBgSvgUrls(container);
}

/**
 * Find every <img> whose src points to an SVG and replace it with an
 * inline <svg> element so that walkElement can capture it as a vector node.
 */
async function inlineSvgImgTags(container: HTMLElement): Promise<void> {
  const imgs = (Array.from(container.querySelectorAll('img')) as HTMLImageElement[])
    .filter(img => isSvgSrc(img.getAttribute('src') || ''));
  if (imgs.length === 0) return;

  // Group by src to avoid duplicate network requests
  const byUrl = new Map<string, HTMLImageElement[]>();
  for (const img of imgs) {
    const src = img.getAttribute('src')!;
    if (!byUrl.has(src)) byUrl.set(src, []);
    byUrl.get(src)!.push(img);
  }

  await Promise.all(
    Array.from(byUrl.entries()).map(async ([src, els]) => {
      const svgText = await fetchSvgContent(src);
      if (!svgText) return;
      for (const img of els) {
        if (!img.parentNode) continue;
        const w = parsePx(img.getAttribute('width') || img.style.width) || img.offsetWidth || 24;
        const h = parsePx(img.getAttribute('height') || img.style.height) || img.offsetHeight || 24;
        const wrapper = document.createElement('div');
        wrapper.innerHTML = svgText;
        const svgEl = wrapper.querySelector('svg');
        if (!svgEl) continue;
        svgEl.setAttribute('width', String(w));
        svgEl.setAttribute('height', String(h));
        if (!svgEl.getAttribute('xmlns')) svgEl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        img.parentNode.replaceChild(svgEl, img);
      }
    })
  );
}

/**
 * Scan for elements using background-image: url("https://...something.svg").
 * Fetches each unique URL and stashes the SVG text on a data attribute so
 * that walkElement can pick it up as svgContent without needing an async fetch.
 */
async function fetchAndStoreBgSvgUrls(container: HTMLElement): Promise<void> {
  const items: Array<{ el: HTMLElement; url: string }> = [];

  container.querySelectorAll('*').forEach((el) => {
    const htmlEl = el as HTMLElement;
    const bgImg = window.getComputedStyle(htmlEl).backgroundImage;
    if (!bgImg || bgImg === 'none') return;
    // Only absolute HTTP/HTTPS URLs — data URIs are handled synchronously
    const urlMatch = bgImg.match(/url\(["']?(https?:\/\/[^"')]+)["']?\)/i);
    if (!urlMatch) return;
    const url = urlMatch[1];
    if (isSvgSrc(url)) items.push({ el: htmlEl, url });
  });

  if (items.length === 0) return;

  const cache = new Map<string, string | null>();
  await Promise.all(
    [...new Set(items.map(({ url }) => url))].map(async (url) => {
      cache.set(url, await fetchSvgContent(url));
    })
  );

  for (const { el, url } of items) {
    const svg = cache.get(url);
    if (svg) el.dataset.bgSvg = svg;
  }
}

// --- Content Root ---

/**
 * Find the first meaningful content element in the container,
 * skipping meta/link/style/script tags that have no visual output.
 * If multiple content elements exist, wrap them in a virtual frame.
 */
function findContentRoot(container: HTMLElement): HTMLElement {
  const contentChildren: HTMLElement[] = [];

  for (const child of Array.from(container.children)) {
    const tag = child.tagName;
    if (SKIP_TAGS.has(tag) || tag === 'STYLE') continue;
    contentChildren.push(child as HTMLElement);
  }

  // Single content root — use it directly
  if (contentChildren.length === 1) {
    return contentChildren[0];
  }

  // Multiple content roots or no content — use the container itself
  // (the container acts as the root frame)
  if (contentChildren.length === 0) {
    return container;
  }

  return container;
}

// --- DOM Traversal ---

function walkElement(
  el: HTMLElement,
  parentRect: DOMRect | null,
  parentLayoutMode: 'HORIZONTAL' | 'VERTICAL' | 'NONE',
  parentAlignItems: string = 'normal',
  parentPaddingH: number = 0,
  parentPaddingV: number = 0
): LayerNode {
  const tag = el.tagName;
  const cs = window.getComputedStyle(el);
  const rect = el.getBoundingClientRect();

  const name = generateName(el);
  const rawNodeType = classifyElement(el);

  // --- SVG content (must be resolved before nodeType is finalised) ---
  // Inline <svg>: serialize directly.
  // Leaf element with background-image SVG data URI: capture as vector.
  let svgContent: string | undefined;
  if (rawNodeType === 'SVG') {
    svgContent = extractSvgContent(el);
  } else if (rawNodeType !== 'TEXT' && el.children.length === 0) {
    // Prefer pre-fetched URL SVG (stored in data attribute by fetchAndStoreBgSvgUrls),
    // then fall back to inline data URI extraction (synchronous).
    svgContent = el.dataset?.bgSvg ?? extractBgSvgDataUri(cs.backgroundImage) ?? undefined;
  }

  // SVGs, background-SVG leaves, and RECT_TAGS all become RECTANGLE.
  const nodeType: 'FRAME' | 'TEXT' | 'RECTANGLE' =
    rawNodeType === 'SVG' || (rawNodeType === 'FRAME' && svgContent != null)
      ? 'RECTANGLE'
      : rawNodeType;
  const layoutMode = nodeType === 'FRAME' ? detectLayoutMode(cs, el) : 'NONE';
  const flexWrap = cs.flexWrap;
  const layoutWrap: 'NO_WRAP' | 'WRAP' =
    (flexWrap === 'wrap' || flexWrap === 'wrap-reverse') ? 'WRAP' : 'NO_WRAP';

  // --- Position detection ---
  const position = cs.position;
  const isAbsolute = position === 'absolute' || position === 'fixed';

  // --- Colors ---
  const bgColor = parseCssColor(cs.backgroundColor);
  const textColor = parseCssColor(cs.color);

  // Per-side border detection: only add a side if style !== 'none' and width > 0
  const borderTopPx = cs.borderTopStyle !== 'none' ? parsePx(cs.borderTopWidth) : 0;
  const borderRightPx = cs.borderRightStyle !== 'none' ? parsePx(cs.borderRightWidth) : 0;
  const borderBottomPx = cs.borderBottomStyle !== 'none' ? parsePx(cs.borderBottomWidth) : 0;
  const borderLeftPx = cs.borderLeftStyle !== 'none' ? parsePx(cs.borderLeftWidth) : 0;
  const maxBorderWidth = Math.max(borderTopPx, borderRightPx, borderBottomPx, borderLeftPx);
  // Pick the color from the first side that actually has a border
  const activeBorderColorSrc =
    (borderTopPx > 0 && cs.borderTopColor) ||
    (borderRightPx > 0 && cs.borderRightColor) ||
    (borderBottomPx > 0 && cs.borderBottomColor) ||
    (borderLeftPx > 0 && cs.borderLeftColor) || '';
  const borderColor = activeBorderColorSrc ? parseCssColor(activeBorderColorSrc) : null;

  // --- Shadows ---
  const shadows = parseBoxShadow(cs.boxShadow).map((s) => ({
    type: (s.inset ? 'INNER_SHADOW' : 'DROP_SHADOW') as
      | 'DROP_SHADOW'
      | 'INNER_SHADOW',
    color: parseCssColor(s.color) || ({ r: 0, g: 0, b: 0, a: 0.25 } as FigmaColorWithAlpha),
    offsetX: s.offsetX,
    offsetY: s.offsetY,
    blur: s.blur,
    spread: s.spread,
  }));

  // --- Border radius ---
  const brTL = parsePx(cs.borderTopLeftRadius);
  const brTR = parsePx(cs.borderTopRightRadius);
  const brBL = parsePx(cs.borderBottomLeftRadius);
  const brBR = parsePx(cs.borderBottomRightRadius);
  const borderRadius =
    brTL === brTR && brTR === brBL && brBL === brBR
      ? brTL
      : ([brTL, brTR, brBR, brBL] as [number, number, number, number]);

  // --- Text properties ---
  const fontWeight = parseInt(cs.fontWeight) || 400;
  const fontSize = parsePx(cs.fontSize) || 16;
  const lineHeight =
    cs.lineHeight === 'normal' ? null : parsePx(cs.lineHeight);
  const fontFamily =
    cs.fontFamily.split(',')[0].replace(/['"]/g, '').trim() || 'Inter';
  const textAlignVal = mapTextAlign(cs.textAlign);
  const textDecoration = cs.textDecorationLine.includes('underline')
    ? 'UNDERLINE'
    : cs.textDecorationLine.includes('line-through')
      ? 'STRIKETHROUGH'
      : 'NONE';

  // --- Text content ---
  // For input/textarea: prefer value, then placeholder. For text elements: innerText.
  let characters = '';
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
    characters = (el as HTMLInputElement).value || el.getAttribute('placeholder') || '';
  } else if (nodeType === 'TEXT') {
    characters = el.innerText || getDirectTextContent(el);
  }

  // --- Children ---
  // Precompute this element's padding for passing to children
  const thisPaddingH = parsePx(cs.paddingLeft) + parsePx(cs.paddingRight);
  const thisPaddingV = parsePx(cs.paddingTop) + parsePx(cs.paddingBottom);
  const thisAlignItems = cs.alignItems;

  const children: LayerNode[] = [];
  if (nodeType === 'FRAME') {
    walkChildren(el, children, rect, layoutMode, cs, thisPaddingH, thisPaddingV, thisAlignItems);
  }

  /** Recursively collect visual children, unwrapping display:contents elements. */
  function walkChildren(
    parent: HTMLElement,
    out: LayerNode[],
    parentRct: DOMRect,
    parentLayout: 'HORIZONTAL' | 'VERTICAL' | 'NONE',
    parentCs: CSSStyleDeclaration,
    paddingH: number,
    paddingV: number,
    alignItems: string
  ): void {
    for (const child of Array.from(parent.children)) {
      const childEl = child as HTMLElement;
      const childTag = childEl.tagName.toUpperCase();

      // Skip non-visual tags
      if (SKIP_TAGS.has(childTag)) continue;

      // Skip SVG child elements (path, rect, etc.) — they belong to their parent SVG
      if (SVG_CHILD_TAGS.has(childTag)) continue;

      const childCs = window.getComputedStyle(childEl);
      if (childCs.display === 'none') continue;

      // display:contents — transparent wrapper, walk its children as direct children
      if (childCs.display === 'contents') {
        walkChildren(childEl, out, parentRct, parentLayout, parentCs, paddingH, paddingV, alignItems);
        continue;
      }

      // SVGs and custom elements (web components like ph-house) may have zero offset dimensions — always include
      const isSvgEl = childTag === SVG_TAG;
      const isCustomEl = childTag.includes('-');
      if (!isSvgEl && !isCustomEl && childEl.offsetWidth === 0 && childEl.offsetHeight === 0) continue;

      out.push(walkElement(childEl, parentRct, parentLayout, alignItems, paddingH, paddingV));
    }

    // Direct text nodes inside the frame
    for (const childNode of Array.from(parent.childNodes)) {
      if (childNode.nodeType === Node.TEXT_NODE) {
        const text = (childNode.textContent || '').trim();
        if (text.length > 0) {
          out.push(createTextNode(text, parentCs));
        }
      }
    }
  }

  // --- Sizing ---
  // Context-aware: block elements fill width only in vertical/none parents, not horizontal
  const inlineWidth = el.style.width;
  const inlineHeight = el.style.height;
  const isBlockLevel = cs.display === 'block' || cs.display === 'list-item' ||
    cs.display === 'flex' || cs.display === 'grid' || cs.display === 'flow-root';
  const hasFlexGrow = parseFloat(cs.flexGrow) > 0;

  // In CSS, align-items defaults to 'normal' which behaves as 'stretch' in flex/grid.
  // Only stretch children should get FILL sizing on the cross-axis.
  // When align-items is 'center'/'flex-end'/'flex-start', children should NOT fill.
  const parentAlignIsStretch =
    parentAlignItems === 'normal' || parentAlignItems === 'stretch';

  // Width-ratio heuristic: element fills parent if it occupies ≥95% of parent CONTENT width
  // (subtract parent padding so children with padding don't fail the ratio check)
  // Guard: don't apply ratio-based fill for very small elements (< 10px on the measured axis)
  // to avoid tiny decorative elements like waveform bars incorrectly becoming FILL.
  const parentW = parentRect ? parentRect.width : 0;
  const parentH = parentRect ? parentRect.height : 0;
  const parentContentW = Math.max(parentW - parentPaddingH, 1);
  const parentContentH = Math.max(parentH - parentPaddingV, 1);
  const MIN_FILL_DIMENSION = 10;
  const fillsByWidthRatio = parentContentW > MIN_FILL_DIMENSION && rect.width >= MIN_FILL_DIMENSION &&
    rect.width >= parentContentW * 0.95;
  const fillsByHeightRatio = parentContentH > MIN_FILL_DIMENSION && rect.height >= MIN_FILL_DIMENSION &&
    rect.height >= parentContentH * 0.95;

  const fillWidth =
    inlineWidth === '100%' ||
    el.getAttribute('width') === '100%' ||
    (hasFlexGrow && parentLayoutMode === 'HORIZONTAL') ||
    // Block-level children fill parent width ONLY when parent's cross-axis alignment
    // implies stretch (normal/stretch). If parent has align-items: center/flex-end,
    // children should NOT fill — they should be sized by content and aligned.
    (isBlockLevel && parentLayoutMode !== 'HORIZONTAL' && parentAlignIsStretch) ||
    fillsByWidthRatio;
  const fillHeight =
    inlineHeight === '100%' ||
    el.getAttribute('height') === '100%' ||
    (hasFlexGrow && parentLayoutMode === 'VERTICAL') ||
    fillsByHeightRatio;

  // --- Opacity (fix: 0 is valid, don't fallback to 1) ---
  const parsedOpacity = parseFloat(cs.opacity);
  const opacity = isNaN(parsedOpacity) ? 1 : parsedOpacity;

  // --- Compute actual spacing from child positions ---
  let itemSpacing = parsePx(cs.gap) || (layoutMode === 'HORIZONTAL' ? parsePx(cs.columnGap) : parsePx(cs.rowGap)) || 0;
  let effectivePaddingTop = parsePx(cs.paddingTop);
  let effectivePaddingLeft = parsePx(cs.paddingLeft);

  if (layoutMode !== 'NONE' && children.length >= 1) {
    const flowChildren = children.filter(c => !c.isAbsolute);
    if (flowChildren.length >= 2 && itemSpacing === 0) {
      const gaps: number[] = [];
      for (let i = 1; i < flowChildren.length; i++) {
        const prev = flowChildren[i - 1];
        const curr = flowChildren[i];
        const gap = layoutMode === 'VERTICAL'
          ? curr.y - (prev.y + prev.height)
          : curr.x - (prev.x + prev.width);
        if (gap > 0) gaps.push(Math.round(gap));
      }
      if (gaps.length > 0) {
        const freq: Record<number, number> = {};
        let modeGap = gaps[0], modeCount = 0;
        for (const g of gaps) {
          freq[g] = (freq[g] || 0) + 1;
          if (freq[g] > modeCount) { modeCount = freq[g]; modeGap = g; }
        }
        itemSpacing = modeGap;
      }
    }
    if (flowChildren.length >= 1) {
      const first = flowChildren[0];
      if (layoutMode === 'VERTICAL' && first.y > effectivePaddingTop) effectivePaddingTop = first.y;
      if (layoutMode === 'HORIZONTAL' && first.x > effectivePaddingLeft) effectivePaddingLeft = first.x;
    }
  }

  return {
    type: nodeType,
    name,
    tag,
    width: Math.round(rect.width),
    height: Math.round(rect.height),
    x: Math.round(parentRect ? rect.left - parentRect.left : 0),
    y: Math.round(parentRect ? rect.top - parentRect.top : 0),
    backgroundColor: bgColor,
    borderColor: borderColor
      ? { r: borderColor.r, g: borderColor.g, b: borderColor.b }
      : null,
    borderWidth: maxBorderWidth,
    borderTopWidth: borderTopPx,
    borderRightWidth: borderRightPx,
    borderBottomWidth: borderBottomPx,
    borderLeftWidth: borderLeftPx,
    borderRadius,
    layoutMode,
    layoutWrap,
    itemSpacing,
    paddingTop: effectivePaddingTop,
    paddingRight: parsePx(cs.paddingRight),
    paddingBottom: parsePx(cs.paddingBottom),
    paddingLeft: effectivePaddingLeft,
    primaryAxisAlign: mapJustifyContent(cs.justifyContent),
    counterAxisAlign: mapAlignItems(cs.alignItems),
    fillWidth: isAbsolute ? false : fillWidth,
    fillHeight: isAbsolute ? false : fillHeight,
    isAbsolute,
    characters,
    fontFamily,
    fontWeight,
    fontSize,
    lineHeight,
    textColor: textColor
      ? { r: textColor.r, g: textColor.g, b: textColor.b }
      : null,
    textAlign: textAlignVal,
    textDecoration: textDecoration as 'NONE' | 'UNDERLINE' | 'STRIKETHROUGH',
    shadows,
    opacity,
    clipsContent: cs.overflow !== 'visible',
    visible: true,
    svgContent,
    children,
  };
}

// --- Helpers ---

function classifyElement(el: HTMLElement): 'FRAME' | 'TEXT' | 'RECTANGLE' | 'SVG' {
  const tag = el.tagName;
  if (tag === SVG_TAG) return 'SVG';
  if (RECT_TAGS.has(tag)) return 'RECTANGLE';
  // Input/textarea/select: capture value/placeholder as text
  if ((tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') &&
      ((el as HTMLInputElement).value || el.getAttribute('placeholder'))) return 'TEXT';
  if (isTextOnlyElement(el)) return 'TEXT';
  return 'FRAME';
}

function isTextOnlyElement(el: HTMLElement): boolean {
  if (TEXT_TAGS.has(el.tagName) && el.children.length === 0) return true;
  // Text tags with only inline text children (strong, em, span, etc.) — treat as single TEXT
  if (TEXT_TAGS.has(el.tagName) && el.children.length > 0) {
    const allInlineText = Array.from(el.children).every(
      (c) => TEXT_TAGS.has(c.tagName) && c.children.length === 0
    );
    if (allInlineText) return true;
  }
  // Elements with no child elements but with text content
  if (
    el.children.length === 0 &&
    (el.textContent || '').trim().length > 0 &&
    !RECT_TAGS.has(el.tagName)
  )
    return true;
  return false;
}

function getDirectTextContent(el: HTMLElement): string {
  let text = '';
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent || '';
    }
  }
  return text.trim() || el.innerText || '';
}

function generateName(el: HTMLElement): string {
  if (el.id) return `#${el.id}`;
  const className =
    el.className && typeof el.className === 'string' ? el.className : '';
  const classes = className
    .split(' ')
    .filter((c) => c.length > 0 && c.length < 30)
    .slice(0, 2)
    .join('.');
  if (classes) return `.${classes}`;

  // For images, include alt text or src filename
  if (el.tagName === 'IMG') {
    const alt = el.getAttribute('alt');
    if (alt) return `img: ${alt.slice(0, 30)}`;
    const src = el.getAttribute('src');
    if (src) {
      const filename = src.split('/').pop()?.split('?')[0];
      if (filename) return `img: ${filename.slice(0, 30)}`;
    }
  }

  return el.tagName.toLowerCase();
}

function extractSvgContent(el: HTMLElement): string {
  // Clone the SVG to avoid mutating the live DOM
  const clone = el.cloneNode(true) as SVGSVGElement;
  // Ensure xmlns for Figma compatibility
  if (!clone.getAttribute('xmlns')) {
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }
  // Ensure width/height attributes exist (Figma needs them)
  const rect = el.getBoundingClientRect();
  const viewBox = clone.getAttribute('viewBox');
  let w = rect.width;
  let h = rect.height;
  if ((w === 0 || h === 0) && viewBox) {
    const parts = viewBox.split(/[\s,]+/).map(Number);
    if (parts.length === 4) {
      w = w || parts[2];
      h = h || parts[3];
    }
  }
  if (!clone.getAttribute('width') && w > 0) {
    clone.setAttribute('width', String(Math.round(w)));
  }
  if (!clone.getAttribute('height') && h > 0) {
    clone.setAttribute('height', String(Math.round(h)));
  }
  return clone.outerHTML;
}

function createTextNode(text: string, parentCs: CSSStyleDeclaration): LayerNode {
  const textColor = parseCssColor(parentCs.color);
  return {
    type: 'TEXT',
    name: text.slice(0, 20),
    tag: '#text',
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    backgroundColor: null,
    borderColor: null,
    borderWidth: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderRadius: 0,
    layoutMode: 'NONE',
    layoutWrap: 'NO_WRAP',
    itemSpacing: 0,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    primaryAxisAlign: 'MIN',
    counterAxisAlign: 'MIN',
    fillWidth: false,
    fillHeight: false,
    isAbsolute: false,
    characters: text,
    fontFamily:
      parentCs.fontFamily.split(',')[0].replace(/['"]/g, '').trim() || 'Inter',
    fontWeight: parseInt(parentCs.fontWeight) || 400,
    fontSize: parseFloat(parentCs.fontSize) || 16,
    lineHeight:
      parentCs.lineHeight === 'normal' ? null : parseFloat(parentCs.lineHeight),
    textColor: textColor
      ? { r: textColor.r, g: textColor.g, b: textColor.b }
      : null,
    textAlign: 'LEFT',
    textDecoration: 'NONE',
    shadows: [],
    opacity: 1,
    clipsContent: false,
    visible: true,
    children: [],
  };
}

/** Log a compact tree summary for debugging (max 3 levels deep) */
function logTreeSummary(node: LayerNode, depth: number): void {
  if (depth > 3) return;
  const indent = '  '.repeat(depth);
  const fill = [node.fillWidth && 'W', node.fillHeight && 'H'].filter(Boolean).join('+');
  const info = [
    node.type,
    `${node.width}x${node.height}`,
    node.layoutMode !== 'NONE' ? node.layoutMode : '',
    node.layoutWrap === 'WRAP' ? 'WRAP' : '',
    fill ? `FILL:${fill}` : '',
    node.isAbsolute ? 'ABS' : '',
    node.type === 'TEXT' ? `"${node.characters.slice(0, 25)}"` : '',
  ].filter(Boolean).join(' ');
  console.log(`[h2f-tree] ${indent}${node.name} → ${info}`);
  for (const child of node.children) {
    logTreeSummary(child, depth + 1);
  }
}
