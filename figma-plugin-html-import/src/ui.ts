import { parseHtml } from './parser/html-parser';

const SERVER_URL = 'http://127.0.0.1:3456';

// --- Server detection ---

let serverAvailable = false;

async function checkServer(): Promise<boolean> {
  try {
    const res = await fetch(`${SERVER_URL}/health`, { signal: AbortSignal.timeout(2000) });
    const data = await res.json();
    return data?.ok === true;
  } catch {
    return false;
  }
}

async function updateServerStatus(): Promise<void> {
  serverAvailable = await checkServer();
  const dot = document.getElementById('status-dot')!;
  const label = document.getElementById('server-label')!;
  const urlHint = document.getElementById('url-hint');
  const urlBtn = document.getElementById('fetch-btn');
  if (serverAvailable) {
    dot.className = 'status-dot online';
    label.textContent = 'Render server connected (high fidelity)';
    if (urlHint) urlHint.textContent = 'URL will be rendered directly via Puppeteer with full CSS, fonts, and images.';
    if (urlBtn) urlBtn.textContent = 'Import';
  } else {
    dot.className = 'status-dot offline';
    label.textContent = 'Render server offline (using client parser)';
    if (urlHint) urlHint.textContent = 'Some sites may block cross-origin requests. Start the render server for direct URL import.';
    if (urlBtn) urlBtn.textContent = 'Fetch';
  }
}

// Check on load, then every 10s
updateServerStatus();
setInterval(updateServerStatus, 10000);

// --- Viewport width presets ---

const viewportInput = document.getElementById('viewport-width') as HTMLInputElement;

document.querySelectorAll('.preset').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.preset').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    viewportInput.value = btn.getAttribute('data-width') || '1440';
  });
});

viewportInput.addEventListener('input', () => {
  const val = viewportInput.value;
  document.querySelectorAll('.preset').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-width') === val);
  });
});

function getViewportWidth(): number {
  const val = parseInt(viewportInput.value);
  return (isNaN(val) || val < 320) ? 1440 : Math.min(val, 3840);
}

// --- Tab switching ---

document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach((c) => c.classList.remove('active'));
    tab.classList.add('active');
    const tabId = `tab-${tab.getAttribute('data-tab')}`;
    document.getElementById(tabId)?.classList.add('active');
  });
});

// --- Server-side rendering ---

async function renderViaServer(html: string, css?: string): Promise<any> {
  const res = await fetch(`${SERVER_URL}/render`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ html, css, viewportWidth: getViewportWidth() }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Server error' }));
    throw new Error(err.error || `Server returned ${res.status}`);
  }
  return res.json();
}

async function renderBatchViaServer(
  pages: Array<{ name: string; html: string; css?: string }>,
  sharedCss?: string
): Promise<any> {
  const res = await fetch(`${SERVER_URL}/render-batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pages, sharedCss, viewportWidth: getViewportWidth() }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Server error' }));
    throw new Error(err.error || `Server returned ${res.status}`);
  }
  return res.json();
}

// --- Convert button ---

const convertBtn = document.getElementById('convert-btn') as HTMLButtonElement;

convertBtn.addEventListener('click', async () => {
  try {
    const html = getHtmlContent();
    if (!html || html.trim().length === 0) {
      showStatus('No HTML content provided. Paste HTML, fetch a URL, or upload a file.', 'error');
      return;
    }

    hideStatus();
    setConverting(true);

    if (serverAvailable) {
      console.log('[h2f-ui] Rendering via Puppeteer server, html length:', html.length);
      showProgress('Rendering via Puppeteer server...');
      await new Promise((r) => setTimeout(r, 50));
      const result = await renderViaServer(html);
      if (!result.tree) throw new Error('Server returned no tree');
      console.log('[h2f-ui] Server returned tree:', {
        rootName: result.tree.name,
        rootSize: `${result.tree.width}x${result.tree.height}`,
        rootLayout: result.tree.layoutMode,
        rootWrap: result.tree.layoutWrap,
        imageCount: result.imageCount,
      });
      showProgress('Creating Figma layers...');
      parent.postMessage({ pluginMessage: { type: 'convert', tree: result.tree } }, '*');
    } else {
      console.log('[h2f-ui] Using client-side parser, html length:', html.length);
      showProgress('Fetching external CSS & icons...');
      await new Promise((r) => setTimeout(r, 50));
      const viewportWidth = getViewportWidth();
      console.log('[h2f-ui] Viewport width:', viewportWidth);
      const tree = await parseHtml(html, viewportWidth);
      console.log('[h2f-ui] Client parser returned tree:', {
        rootName: tree.name,
        rootSize: `${tree.width}x${tree.height}`,
        rootLayout: tree.layoutMode,
        rootWrap: tree.layoutWrap,
        children: tree.children.length,
      });
      showProgress('Creating Figma layers...');
      parent.postMessage({ pluginMessage: { type: 'convert', tree } }, '*');
    }
  } catch (err) {
    hideProgress();
    setConverting(false);
    showStatus(`Parse error: ${(err as Error).message}`, 'error');
  }
});

// --- URL fetch / render ---

const fetchBtn = document.getElementById('fetch-btn') as HTMLButtonElement;

fetchBtn.addEventListener('click', async () => {
  const urlInput = document.getElementById('url-input') as HTMLInputElement;
  let url = urlInput.value.trim();
  if (!url) {
    showStatus('Enter a URL to fetch', 'error');
    return;
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
    urlInput.value = url;
  }

  try {
    fetchBtn.disabled = true;
    hideStatus();

    if (serverAvailable) {
      // Server available → render the URL directly via Puppeteer (bypasses CORS)
      fetchBtn.textContent = 'Rendering...';
      setConverting(true);
      showProgress('Navigating to URL via Puppeteer...');

      const res = await fetch(`${SERVER_URL}/render-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, viewportWidth: getViewportWidth() }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Server error' }));
        throw new Error(err.error || `Server returned ${res.status}`);
      }

      const result = await res.json();
      if (!result.tree) throw new Error('Server returned no tree');

      showProgress('Creating Figma layers...');
      parent.postMessage({ pluginMessage: { type: 'convert', tree: result.tree } }, '*');
    } else {
      // No server → try fetching HTML source (may fail due to CORS)
      fetchBtn.textContent = 'Fetching...';

      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const html = await response.text();

      const textarea = document.getElementById('html-input') as HTMLTextAreaElement;
      textarea.value = html;

      switchToTab('paste');
      showStatus(`Fetched ${(html.length / 1024).toFixed(1)} KB from ${url}`, 'success');
    }
  } catch (err) {
    hideProgress();
    setConverting(false);
    const msg = serverAvailable
      ? `Render failed: ${(err as Error).message}`
      : `Fetch failed: ${(err as Error).message}. Start the render server for direct URL import, or copy-paste the page source.`;
    showStatus(msg, 'error');
  } finally {
    fetchBtn.disabled = false;
    fetchBtn.textContent = serverAvailable ? 'Import' : 'Fetch';
  }
});

// --- File upload (single file) ---

document.getElementById('file-input')?.addEventListener('change', (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const textarea = document.getElementById('html-input') as HTMLTextAreaElement;
    textarea.value = reader.result as string;
    document.getElementById('file-name')!.textContent = file.name;
    switchToTab('paste');
    showStatus(`Loaded ${file.name}`, 'success');
  };
  reader.onerror = () => showStatus('Failed to read file', 'error');
  reader.readAsText(file);
});

// --- Folder upload (batch import ALL HTML files) ---

// Stored batch data from folder selection
let pendingBatch: { htmlFiles: Array<{ name: string; html: string; css?: string }>; sharedCss: string } | null = null;

document.getElementById('folder-input')?.addEventListener('change', async (e) => {
  const files = (e.target as HTMLInputElement).files;
  if (!files || files.length === 0) return;

  const htmlFiles: Array<{ name: string; file: File }> = [];
  const cssFiles: File[] = [];

  for (const file of Array.from(files)) {
    const name = file.name.toLowerCase();
    if (name.endsWith('.html') || name.endsWith('.htm')) {
      htmlFiles.push({ name: file.name, file });
    }
    if (name.endsWith('.css')) {
      cssFiles.push(file);
    }
  }

  if (htmlFiles.length === 0) {
    showStatus('No HTML files found in folder.', 'error');
    return;
  }

  try {
    // Read all CSS files
    const cssContents = await Promise.all(cssFiles.map(readFileAsText));
    const sharedCss = cssContents.join('\n');

    // Read all HTML files
    const pages: Array<{ name: string; html: string }> = [];
    for (const { name, file } of htmlFiles) {
      const html = await readFileAsText(file);
      pages.push({ name: name.replace(/\.(html|htm)$/i, ''), html });
    }

    // Sort: index.html first, then alphabetical
    pages.sort((a, b) => {
      if (a.name.toLowerCase() === 'index') return -1;
      if (b.name.toLowerCase() === 'index') return 1;
      return a.name.localeCompare(b.name);
    });

    // Store batch for import
    pendingBatch = { htmlFiles: pages, sharedCss };

    // If single HTML file, also load into textarea as fallback
    if (pages.length === 1) {
      const textarea = document.getElementById('html-input') as HTMLTextAreaElement;
      let finalHtml = pages[0].html;
      if (sharedCss) {
        if (finalHtml.includes('</head>')) {
          finalHtml = finalHtml.replace('</head>', `<style>${sharedCss}</style>\n</head>`);
        } else {
          finalHtml = `<style>${sharedCss}</style>\n${finalHtml}`;
        }
      }
      textarea.value = finalHtml;
    }

    const parts = [`${pages.length} HTML`];
    if (cssFiles.length > 0) parts.push(`${cssFiles.length} CSS`);

    document.getElementById('file-name')!.textContent = parts.join(' + ');
    showStatus(
      pages.length > 1
        ? `Found ${pages.length} HTML files. Click "Import to Figma" to batch import all.`
        : `Loaded ${pages[0].name}`,
      'success'
    );

    // Update button text for batch
    if (pages.length > 1) {
      convertBtn.textContent = `Import ${pages.length} pages to Figma`;
    }
  } catch (err) {
    showStatus(`Failed to read folder: ${(err as Error).message}`, 'error');
  }
});

// Override convert button to handle batch
const originalClickHandler = convertBtn.onclick;
convertBtn.addEventListener('click', async (e) => {
  if (!pendingBatch || pendingBatch.htmlFiles.length <= 1) return;

  // Prevent the normal single-file handler
  e.stopImmediatePropagation();

  try {
    hideStatus();
    setConverting(true);
    const { htmlFiles, sharedCss } = pendingBatch;

    if (serverAvailable) {
      // Batch render via server
      showProgress(`Rendering ${htmlFiles.length} pages via server...`);
      await new Promise((r) => setTimeout(r, 50));

      const result = await renderBatchViaServer(htmlFiles, sharedCss);

      const validPages = result.results.filter((r: any) => r.tree);
      if (validPages.length === 0) throw new Error('No pages rendered successfully');

      showProgress(`Creating ${validPages.length} Figma frames...`);
      parent.postMessage(
        { pluginMessage: { type: 'convert-batch', pages: validPages } },
        '*'
      );
    } else {
      // Client-side batch: parse each HTML file sequentially
      const viewportWidth = getViewportWidth();
      const trees: Array<{ name: string; tree: any }> = [];

      for (let i = 0; i < htmlFiles.length; i++) {
        const page = htmlFiles[i];
        showBatchProgress(i + 1, htmlFiles.length, page.name);
        showProgress(`Parsing ${page.name}...`);

        // Inline shared CSS into HTML
        let html = page.html;
        if (sharedCss) {
          if (html.includes('</head>')) {
            html = html.replace('</head>', `<style>${sharedCss}</style>\n</head>`);
          } else {
            html = `<style>${sharedCss}</style>\n${html}`;
          }
        }

        const tree = await parseHtml(html, viewportWidth);
        trees.push({ name: page.name, tree });
      }

      showProgress(`Creating ${trees.length} Figma frames...`);
      parent.postMessage(
        { pluginMessage: { type: 'convert-batch', pages: trees } },
        '*'
      );
    }
  } catch (err) {
    hideProgress();
    hideBatchProgress();
    setConverting(false);
    showStatus(`Batch import error: ${(err as Error).message}`, 'error');
  }
}, true); // useCapture=true so this runs before the default handler

// --- Messages from main thread ---

window.onmessage = (event) => {
  const msg = event.data.pluginMessage;
  if (!msg) return;

  if (msg.type === 'progress') {
    const pct = Math.round((msg.current / msg.total) * 100);
    updateProgress(pct, `Creating layers... ${msg.current}/${msg.total}`);
  }

  if (msg.type === 'batch-progress') {
    showBatchProgress(msg.current, msg.total, msg.pageName);
  }

  if (msg.type === 'done') {
    hideProgress();
    hideBatchProgress();
    setConverting(false);
    pendingBatch = null;
    convertBtn.textContent = 'Import to Figma';

    const label = msg.pageCount
      ? `Imported ${msg.pageCount} pages (${msg.nodeCount} layers) into Figma`
      : `Imported ${msg.nodeCount} layers into Figma`;
    showStatus(label, 'success');
  }

  if (msg.type === 'error') {
    hideProgress();
    hideBatchProgress();
    setConverting(false);
    showStatus(`Error: ${msg.message}`, 'error');
  }
};

// --- Helpers ---

function getHtmlContent(): string {
  return (document.getElementById('html-input') as HTMLTextAreaElement).value;
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

function switchToTab(tabName: string) {
  const tab = document.querySelector(`.tab[data-tab="${tabName}"]`);
  if (tab) (tab as HTMLElement).click();
}

function showProgress(text: string) {
  const el = document.getElementById('progress')!;
  el.classList.remove('hidden');
  document.getElementById('progress-text')!.textContent = text;
  document.getElementById('progress-fill')!.style.width = '0%';
}

function updateProgress(pct: number, text: string) {
  document.getElementById('progress-fill')!.style.width = `${pct}%`;
  document.getElementById('progress-text')!.textContent = text;
}

function hideProgress() {
  document.getElementById('progress')!.classList.add('hidden');
}

function showBatchProgress(current: number, total: number, pageName: string) {
  const el = document.getElementById('batch-progress')!;
  el.classList.remove('hidden');
  document.getElementById('batch-text')!.textContent = `Page ${current}/${total}: ${pageName}`;
}

function hideBatchProgress() {
  document.getElementById('batch-progress')!.classList.add('hidden');
}

function showStatus(msg: string, type: 'error' | 'success') {
  const el = document.getElementById('status')!;
  el.classList.remove('hidden', 'error', 'success');
  el.classList.add(type);
  el.textContent = msg;

  if (type === 'success') {
    setTimeout(() => {
      el.classList.add('hidden');
    }, 5000);
  }
}

function hideStatus() {
  document.getElementById('status')!.classList.add('hidden');
}

function setConverting(converting: boolean) {
  convertBtn.disabled = converting;
  if (converting) {
    convertBtn.textContent = 'Converting...';
  } else if (!pendingBatch || pendingBatch.htmlFiles.length <= 1) {
    convertBtn.textContent = 'Import to Figma';
  }
}
