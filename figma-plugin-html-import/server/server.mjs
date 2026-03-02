/**
 * h2f-render-server — Local Puppeteer companion for the HTML→Figma plugin.
 *
 * Renders HTML in a real Chromium instance, walks the DOM to produce a
 * LayerNode tree, and screenshots raster elements (images, canvas, video)
 * at 2× resolution. The Figma plugin detects this server automatically.
 *
 * Endpoints:
 *   GET  /health          → { ok: true }
 *   POST /render          → single HTML → LayerNode tree + images
 *   POST /render-batch    → array of { name, html, css? } → array of trees
 */

import express from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PORT = parseInt(process.env.PORT || '3456', 10);
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.text({ limit: '50mb', type: 'text/html' }));

// --- Browser singleton ---

/** @type {import('puppeteer').Browser | null} */
let browser = null;

async function getBrowser() {
  if (!browser || !browser.connected) {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--font-render-hinting=none',
      ],
    });
  }
  return browser;
}

// Load scripts that will be injected into pages.
// Re-read on each request in development so code changes take effect immediately
// without requiring a server restart.
const scriptPaths = {
  walker: join(__dirname, 'walker.mjs'),
  iconReplacer: join(__dirname, 'icon-replacer.mjs'),
};

function getWalkerCode() {
  return readFileSync(scriptPaths.walker, 'utf8');
}

function getIconReplacerCode() {
  return readFileSync(scriptPaths.iconReplacer, 'utf8');
}

// --- Health check ---

app.get('/health', (_req, res) => {
  res.json({ ok: true, version: '1.0.0' });
});

// --- Single render ---

app.post('/render', async (req, res) => {
  try {
    const { html, css, viewportWidth = 1440, theme = 'light' } = typeof req.body === 'string'
      ? { html: req.body, css: undefined, viewportWidth: 1440, theme: 'light' }
      : req.body;

    if (!html) return res.status(400).json({ error: 'No HTML provided' });

    const result = await renderPage(html, css, viewportWidth, theme);
    res.json(result);
  } catch (err) {
    console.error('[render]', err);
    res.status(500).json({ error: err.message });
  }
});

// --- Render from live URL ---

app.post('/render-url', async (req, res) => {
  try {
    const { url, viewportWidth = 1440 } = req.body;
    if (!url) return res.status(400).json({ error: 'No URL provided' });

    const result = await renderUrl(url, viewportWidth);
    res.json(result);
  } catch (err) {
    console.error('[render-url]', err);
    res.status(500).json({ error: err.message });
  }
});

// --- Batch render ---

app.post('/render-batch', async (req, res) => {
  try {
    const { pages, viewportWidth = 1440, sharedCss } = req.body;
    if (!Array.isArray(pages) || pages.length === 0) {
      return res.status(400).json({ error: 'pages must be a non-empty array' });
    }

    const results = [];
    for (const page of pages) {
      const { name, html, css } = page;
      try {
        const combinedCss = [sharedCss, css].filter(Boolean).join('\n');
        const result = await renderPage(html, combinedCss || undefined, viewportWidth);
        results.push({ name, ...result });
      } catch (err) {
        results.push({ name, error: err.message, tree: null, images: {} });
      }
    }
    res.json({ results });
  } catch (err) {
    console.error('[render-batch]', err);
    res.status(500).json({ error: err.message });
  }
});

// --- Variations endpoint ---

app.post('/render-variations', async (req, res) => {
  try {
    const { html, css, viewportWidth = 1440, themes = ['light'] } = req.body;
    if (!html) return res.status(400).json({ error: 'No HTML provided' });
    if (!Array.isArray(themes) || themes.length === 0) {
      return res.status(400).json({ error: 'themes must be a non-empty array' });
    }

    const results = [];
    for (const theme of themes) {
      try {
        const result = await renderPage(html, css, viewportWidth, theme);
        results.push({ theme, viewport: viewportWidth, ...result });
      } catch (err) {
        results.push({ theme, viewport: viewportWidth, error: err.message, tree: null });
      }
    }
    res.json({ results });
  } catch (err) {
    console.error('[render-variations]', err);
    res.status(500).json({ error: err.message });
  }
});

// --- Core rendering logic ---

async function renderPage(html, css, viewportWidth = 1440, theme = 'light') {
  console.log(`[h2f-server] renderPage: viewport=${viewportWidth}, theme=${theme}, html=${html.length} chars, css=${css ? css.length : 0} chars`);
  const b = await getBrowser();
  const page = await b.newPage();

  // Forward browser console to server console for debugging
  page.on('console', msg => {
    const text = msg.text();
    if (text.startsWith('[h2f')) console.log(`  [browser] ${text}`);
  });

  try {
    await page.setViewport({
      width: viewportWidth,
      height: 900,
      deviceScaleFactor: 2,
    });

    // Emulate prefers-color-scheme so light/dark variants render correctly
    await page.emulateMediaFeatures([
      { name: 'prefers-color-scheme', value: theme },
    ]);

    // Build full HTML document
    const fullHtml = buildFullDocument(html, css);
    console.log(`[h2f-server] Full HTML document: ${fullHtml.length} chars`);

    // Load the page with full network resolution
    await page.setContent(fullHtml, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);

    // Additional settle time for web components, lazy images, etc.
    await page.evaluate(() => new Promise(r => setTimeout(r, 500)));

    // Inject and run icon replacement (icon fonts → inline SVGs, SVG imgs → inline, etc.)
    await page.addScriptTag({ content: getIconReplacerCode() });
    const iconStats = await page.evaluate(() => window.replaceAllIcons());
    if (iconStats) {
      console.log(`[icons] replaced=${iconStats.iconsReplaced} placeholder=${iconStats.iconsPlaceholder} svgImgs=${iconStats.svgImgsInlined} bgSvgs=${iconStats.bgSvgsFetched}`);
    }

    // Wait for DOM to settle after icon replacement
    await page.evaluate(() => new Promise(r => setTimeout(r, 200)));

    // Inject the walker script and run it
    await page.addScriptTag({ content: getWalkerCode() });

    const result = await page.evaluate(() => {
      const body = document.body;
      if (!body) return { tree: null, markedIds: [] };

      // Find meaningful content root (skip meta/style wrappers)
      let root = body;
      const skipTags = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'META', 'LINK', 'HEAD', 'BR', 'WBR', 'TEMPLATE']);
      const contentChildren = Array.from(root.children).filter(
        c => !skipTags.has(c.tagName.toUpperCase()) && c.tagName.toUpperCase() !== 'STYLE'
      );
      if (contentChildren.length === 1) root = contentChildren[0];

      // walkDOM is injected as a global function by addScriptTag
      const tree = window.walkDOM(root, null, 'NONE');

      // Collect marked element IDs for screenshot capture
      const markedEls = document.querySelectorAll('[data-h2f-id]');
      const markedIds = Array.from(markedEls).map(el => ({
        id: el.getAttribute('data-h2f-id'),
        rect: el.getBoundingClientRect().toJSON(),
      }));

      return { tree, markedIds };
    });

    // Screenshot marked elements (images, canvas, video)
    const images = {};
    for (const { id, rect } of result.markedIds) {
      if (rect.width <= 0 || rect.height <= 0) continue;
      try {
        const el = await page.$(`[data-h2f-id="${id}"]`);
        if (!el) continue;
        const screenshot = await el.screenshot({
          type: 'png',
          omitBackground: true,
        });
        // Convert Buffer to base64
        images[id] = screenshot.toString('base64');
      } catch (err) {
        console.warn(`[screenshot] Failed for ${id}:`, err.message);
      }
    }

    // Attach imageData to tree nodes
    attachImageData(result.tree, images);

    // Clean up _h2fId fields from the tree
    cleanH2fIds(result.tree);

    // Log tree summary
    const nodeCount = countNodes(result.tree);
    console.log(`[h2f-server] Tree complete: ${nodeCount} nodes, ${Object.keys(images).length} images`);
    console.log(`[h2f-server] Root: ${result.tree.name} ${result.tree.width}x${result.tree.height} ${result.tree.layoutMode} wrap:${result.tree.layoutWrap}`);

    return { tree: result.tree, imageCount: Object.keys(images).length };
  } finally {
    await page.close();
  }
}

/**
 * Navigate to a live URL, wait for it to load, then walk the DOM.
 */
async function renderUrl(url, viewportWidth = 1440) {
  const b = await getBrowser();
  const page = await b.newPage();

  try {
    await page.setViewport({
      width: viewportWidth,
      height: 900,
      deviceScaleFactor: 2,
    });

    // Navigate to the actual URL
    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Wait for fonts and settle time
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => new Promise(r => setTimeout(r, 1000)));

    // Icon replacement
    await page.addScriptTag({ content: getIconReplacerCode() });
    const iconStats = await page.evaluate(() => window.replaceAllIcons());
    if (iconStats) {
      console.log(`[icons] replaced=${iconStats.iconsReplaced} placeholder=${iconStats.iconsPlaceholder}`);
    }
    await page.evaluate(() => new Promise(r => setTimeout(r, 200)));

    // Walk the DOM
    await page.addScriptTag({ content: getWalkerCode() });

    const result = await page.evaluate(() => {
      const body = document.body;
      if (!body) return { tree: null, markedIds: [] };

      const tree = window.walkDOM(body, null, 'NONE');

      const markedEls = document.querySelectorAll('[data-h2f-id]');
      const markedIds = Array.from(markedEls).map(el => ({
        id: el.getAttribute('data-h2f-id'),
        rect: el.getBoundingClientRect().toJSON(),
      }));

      return { tree, markedIds };
    });

    // Screenshot marked elements
    const images = {};
    for (const { id, rect } of result.markedIds) {
      if (rect.width <= 0 || rect.height <= 0) continue;
      try {
        const el = await page.$(`[data-h2f-id="${id}"]`);
        if (!el) continue;
        const screenshot = await el.screenshot({ type: 'png', omitBackground: true });
        images[id] = screenshot.toString('base64');
      } catch (err) {
        console.warn(`[screenshot] Failed for ${id}:`, err.message);
      }
    }

    attachImageData(result.tree, images);
    cleanH2fIds(result.tree);

    return { tree: result.tree, imageCount: Object.keys(images).length };
  } finally {
    await page.close();
  }
}

/**
 * Wrap HTML content in a proper document structure if it isn't already one.
 */
function buildFullDocument(html, css) {
  const trimmed = html.trim();
  const isFullDoc = trimmed.startsWith('<!') ||
    trimmed.toLowerCase().startsWith('<html') ||
    /^<head[\s>]/i.test(trimmed);

  if (isFullDoc) {
    // Inject extra CSS before </head> if provided
    if (css) {
      if (html.includes('</head>')) {
        return html.replace('</head>', `<style>${css}</style>\n</head>`);
      }
      return `<style>${css}</style>\n${html}`;
    }
    return html;
  }

  // Fragment → wrap in a full document
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ${css ? `<style>${css}</style>` : ''}
</head>
<body style="margin:0;padding:0;">
  ${html}
</body>
</html>`;
}

/**
 * Walk the LayerNode tree and attach base64 imageData from screenshots.
 */
function attachImageData(node, images) {
  if (!node) return;
  if (node._h2fId && images[node._h2fId]) {
    node.imageData = images[node._h2fId];
  }
  if (node.children) {
    for (const child of node.children) {
      attachImageData(child, images);
    }
  }
}

/**
 * Count total nodes in tree (for logging).
 */
function countNodes(node) {
  if (!node) return 0;
  return 1 + (node.children || []).reduce((sum, c) => sum + countNodes(c), 0);
}

/**
 * Remove _h2fId markers from the tree (not needed by the plugin).
 */
function cleanH2fIds(node) {
  if (!node) return;
  delete node._h2fId;
  if (node.children) {
    for (const child of node.children) {
      cleanH2fIds(child);
    }
  }
}

// --- Server lifecycle ---

app.listen(PORT, '127.0.0.1', () => {
  console.log(`\n  h2f-render-server running at http://127.0.0.1:${PORT}`);
  console.log(`  Endpoints:`);
  console.log(`    GET  /health`);
  console.log(`    POST /render             { html, css?, viewportWidth?, theme? }`);
  console.log(`    POST /render-variations  { html, css?, viewportWidth?, themes: string[] }`);
  console.log(`    POST /render-batch       { pages: [{ name, html, css? }], sharedCss?, viewportWidth? }`);
  console.log(`\n  Ctrl+C to stop\n`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  if (browser) await browser.close();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  if (browser) await browser.close();
  process.exit(0);
});
