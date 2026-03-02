/**
 * Icon font replacement script — injected into Puppeteer pages before walking.
 * Detects icon font elements (Phosphor, Font Awesome, Bootstrap, Material, etc.)
 * and replaces them with inline SVGs fetched from CDN.
 *
 * Also handles:
 *   - <img src="*.svg"> → inline <svg>
 *   - background-image: url(*.svg) → data attribute for walker pickup
 *   - Phosphor web components (<ph-*>)
 *   - Generic icon font detection by font-family keywords
 *   - ::before/::after pseudo-element content: url() SVGs
 */

// --- Icon font detection ---

const ICON_FONT_KEYWORDS = [
  'icon', 'symbol', 'glyph', 'awesome', 'ionicon', 'icomoon', 'themify',
  'feather', 'remix', 'tabler', 'heroicon', 'lucide', 'eva', 'devicon',
  'dashicon', 'glyphicon', 'octicon', 'phosphor',
];

function detectIconFont(el) {
  const tag = el.tagName.toLowerCase();

  // Phosphor web components: <ph-house>, <ph-waveform weight="fill">, etc.
  if (tag.startsWith('ph-')) {
    const name = tag.slice(3);
    if (!name) return null;
    const weight = (el.getAttribute('weight') || 'regular').toLowerCase();
    const filename = weight === 'regular' ? `${name}.svg` : `${name}-${weight}.svg`;
    return {
      name, weight,
      svgUrl: `https://unpkg.com/@phosphor-icons/core/assets/${weight}/${filename}`,
    };
  }

  const classes = Array.from(el.classList);

  // Phosphor CSS classes
  if (classes.some(c => c === 'ph' || c.startsWith('ph-'))) {
    const WEIGHTS = ['ph-fill', 'ph-thin', 'ph-light', 'ph-bold', 'ph-duotone'];
    const weightClass = classes.find(c => WEIGHTS.includes(c));
    const nameClass = classes.find(c => c.startsWith('ph-') && !WEIGHTS.includes(c));
    if (!nameClass) return null;
    const name = nameClass.replace('ph-', '');
    const weight = weightClass ? weightClass.replace('ph-', '') : 'regular';
    const filename = weight === 'regular' ? `${name}.svg` : `${name}-${weight}.svg`;
    return { name, weight, svgUrl: `https://unpkg.com/@phosphor-icons/core/assets/${weight}/${filename}` };
  }

  // Font Awesome
  if (classes.some(c => c === 'fa' || c === 'fas' || c === 'far' || c === 'fab' || c === 'fal' || c.startsWith('fa-'))) {
    let variant = 'solid';
    if (classes.includes('far') || classes.includes('fa-regular')) variant = 'regular';
    if (classes.includes('fab') || classes.includes('fa-brands')) variant = 'brands';
    if (classes.includes('fal') || classes.includes('fa-light')) variant = 'light';
    const nameClass = classes.find(c =>
      c.startsWith('fa-') && !['fa-solid', 'fa-regular', 'fa-brands', 'fa-light', 'fa-duotone', 'fa-thin'].includes(c)
    );
    if (!nameClass) return null;
    const name = nameClass.replace('fa-', '');
    return { name, weight: variant, svgUrl: `https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/${variant}/${name}.svg` };
  }

  // Bootstrap Icons
  if (classes.some(c => c === 'bi' || c.startsWith('bi-'))) {
    const nameClass = classes.find(c => c.startsWith('bi-'));
    if (!nameClass) return null;
    const name = nameClass.replace('bi-', '');
    return { name, weight: 'regular', svgUrl: `https://unpkg.com/bootstrap-icons/icons/${name}.svg` };
  }

  // Material Icons/Symbols
  if (classes.some(c => c.startsWith('material-icons') || c.startsWith('material-symbols'))) {
    const name = el.textContent?.trim().replace(/_/g, '-');
    if (!name) return null;
    const variant = classes.includes('material-symbols-rounded') ? 'rounded'
      : classes.includes('material-symbols-sharp') ? 'sharp' : 'outlined';
    return { name, weight: variant, svgUrl: `https://unpkg.com/@material-design-icons/svg/${variant}/${name.replace(/-/g, '_')}.svg` };
  }

  // Lucide Icons
  if (classes.some(c => c.startsWith('lucide-') || c === 'lucide')) {
    const nameClass = classes.find(c => c.startsWith('lucide-'));
    if (!nameClass) return null;
    const name = nameClass.replace('lucide-', '');
    return { name, weight: 'regular', svgUrl: `https://unpkg.com/lucide-static/icons/${name}.svg` };
  }

  // Heroicons
  if (classes.some(c => c.startsWith('heroicon-'))) {
    const nameClass = classes.find(c => c.startsWith('heroicon-'));
    if (!nameClass) return null;
    const name = nameClass.replace('heroicon-', '');
    return { name, weight: 'outline', svgUrl: `https://unpkg.com/heroicons/24/outline/${name}.svg` };
  }

  // ::before / ::after pseudo-element with content: url("icon.svg")
  for (const pseudo of ['::before', '::after']) {
    const content = window.getComputedStyle(el, pseudo).content;
    if (!content || content === 'none' || content === '""' || content === "''") continue;
    const urlMatch = content.match(/url\(["']?([^"')]+)["']?\)/i);
    if (urlMatch && isSvgSrc(urlMatch[1])) {
      return { name: el.title || el.className || 'icon', weight: 'regular', svgUrl: urlMatch[1] };
    }
  }

  // Generic fallback: font-family looks like an icon font
  const fontFamily = window.getComputedStyle(el).fontFamily.toLowerCase();
  if (ICON_FONT_KEYWORDS.some(kw => fontFamily.includes(kw))) {
    return { name: el.textContent?.trim() || 'icon', weight: 'regular', svgUrl: '' };
  }

  return null;
}

function isSvgSrc(src) {
  if (!src) return false;
  if (src.startsWith('data:image/svg+xml')) return true;
  const clean = src.split('?')[0].split('#')[0].toLowerCase();
  return clean.endsWith('.svg');
}

async function fetchSvgContent(src) {
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
  } catch { return null; }
}

function applyIconPlaceholder(el, name) {
  const cs = window.getComputedStyle(el);
  const size = parseFloat(cs.fontSize) || parseFloat(cs.width) || parseFloat(cs.height) || 24;
  el.style.display = 'inline-block';
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  el.style.borderRadius = `${Math.round(size / 6)}px`;
  el.style.backgroundColor = cs.color || '#71717a';
  el.style.flexShrink = '0';
  el.title = `icon: ${name}`;
}

function applySvgToElement(el, svgText) {
  const cs = window.getComputedStyle(el);
  const size = parseFloat(cs.fontSize) || parseFloat(cs.width) || parseFloat(cs.height) || 24;
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

// --- Main replacement function (called from server.mjs) ---

async function replaceAllIcons() {
  // --- Pass 1: Icon font elements ---
  const iconElements = [];
  document.querySelectorAll('*').forEach(el => {
    const match = detectIconFont(el);
    if (match) iconElements.push({ el, match });
  });

  // Placeholder for unfetchable icons
  for (const { el, match } of iconElements.filter(({ match }) => !match.svgUrl)) {
    applyIconPlaceholder(el, match.name);
  }

  // Fetch SVGs in batches
  const fetchable = iconElements.filter(({ match }) => !!match.svgUrl);
  const svgCache = new Map();
  const uniqueUrls = [...new Set(fetchable.map(({ match }) => match.svgUrl))];
  const BATCH = 20;
  for (let i = 0; i < uniqueUrls.length; i += BATCH) {
    const results = await Promise.all(
      uniqueUrls.slice(i, i + BATCH).map(async url => {
        try {
          const res = await fetch(url);
          if (!res.ok) return { url, svg: null };
          const text = await res.text();
          return { url, svg: text.includes('<svg') ? text : null };
        } catch { return { url, svg: null }; }
      })
    );
    results.forEach(({ url, svg }) => svgCache.set(url, svg));
  }

  for (const { el, match } of fetchable) {
    const svg = svgCache.get(match.svgUrl);
    if (svg) applySvgToElement(el, svg);
    else applyIconPlaceholder(el, match.name);
  }

  // --- Pass 2: Inline <img src="*.svg"> ---
  const svgImgs = Array.from(document.querySelectorAll('img')).filter(img => isSvgSrc(img.getAttribute('src') || ''));
  if (svgImgs.length > 0) {
    const byUrl = new Map();
    for (const img of svgImgs) {
      const src = img.getAttribute('src');
      if (!byUrl.has(src)) byUrl.set(src, []);
      byUrl.get(src).push(img);
    }
    await Promise.all(
      Array.from(byUrl.entries()).map(async ([src, imgs]) => {
        const svgText = await fetchSvgContent(src);
        if (!svgText) return;
        for (const img of imgs) {
          if (!img.parentNode) continue;
          const w = parseFloat(img.getAttribute('width') || img.style.width) || img.offsetWidth || 24;
          const h = parseFloat(img.getAttribute('height') || img.style.height) || img.offsetHeight || 24;
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

  // --- Pass 3: Background-image SVG URLs → data attribute ---
  const bgItems = [];
  document.querySelectorAll('*').forEach(el => {
    const bgImg = window.getComputedStyle(el).backgroundImage;
    if (!bgImg || bgImg === 'none') return;
    const urlMatch = bgImg.match(/url\(["']?(https?:\/\/[^"')]+)["']?\)/i);
    if (!urlMatch) return;
    const url = urlMatch[1];
    if (isSvgSrc(url)) bgItems.push({ el, url });
  });

  if (bgItems.length > 0) {
    const bgCache = new Map();
    await Promise.all(
      [...new Set(bgItems.map(({ url }) => url))].map(async url => {
        bgCache.set(url, await fetchSvgContent(url));
      })
    );
    for (const { el, url } of bgItems) {
      const svg = bgCache.get(url);
      if (svg) el.dataset.bgSvg = svg;
    }
  }

  return {
    iconsReplaced: fetchable.filter(({ match }) => svgCache.get(match.svgUrl)).length,
    iconsPlaceholder: iconElements.filter(({ match }) => !match.svgUrl).length + fetchable.filter(({ match }) => !svgCache.get(match.svgUrl)).length,
    svgImgsInlined: svgImgs.length,
    bgSvgsFetched: bgItems.filter(({ url }) => !!url).length,
  };
}
