/**
 * DOM walker — injected into Puppeteer pages via page.addScriptTag().
 * Mirrors the logic in html-parser.ts but runs in a real Chromium instance
 * with full CSS/font/layout support.
 *
 * Returns a LayerNode tree (same shape as types.ts) with an additional
 * `_h2fId` marker on elements that need a screenshot (images, canvases, etc.).
 *
 * IMPORTANT: SVG elements in the DOM have lowercase tagName ('svg', 'path', etc.)
 * while HTML elements have uppercase ('DIV', 'SPAN'). We normalize to uppercase
 * using tagUpper() everywhere.
 */

// --- Tag classification ---

const SKIP_TAGS = new Set([
  'SCRIPT', 'STYLE', 'NOSCRIPT', 'META', 'LINK', 'HEAD', 'BR', 'WBR',
  'TEMPLATE', 'IFRAME', 'OBJECT', 'EMBED',
]);

const TEXT_TAGS = new Set([
  'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SPAN', 'A', 'LABEL',
  'STRONG', 'EM', 'B', 'I', 'U', 'S', 'CODE', 'PRE', 'BLOCKQUOTE',
  'SMALL', 'SUB', 'SUP', 'MARK', 'DEL', 'INS', 'ABBR', 'CITE', 'Q',
  'TIME', 'KBD', 'SAMP', 'VAR',
]);

const RECT_TAGS = new Set(['IMG', 'HR', 'VIDEO', 'CANVAS', 'AUDIO']);

// Elements that should be captured as raster screenshots
const RASTER_TAGS = new Set(['IMG', 'VIDEO', 'CANVAS']);

// SVG child element tags — these should never be walked as separate nodes
const SVG_CHILD_TAGS = new Set([
  'PATH', 'RECT', 'CIRCLE', 'ELLIPSE', 'LINE', 'POLYLINE', 'POLYGON',
  'TEXT', 'TSPAN', 'G', 'DEFS', 'CLIPPATH', 'MASK', 'USE', 'SYMBOL',
  'LINEARGRADIENT', 'RADIALGRADIENT', 'STOP', 'PATTERN', 'FILTER',
  'FEGAUSSIANBLUR', 'FEOFFSET', 'FEBLEND', 'FECOLORMATRIX',
  'FOREIGNOBJECT', 'IMAGE', 'ANIMATE', 'ANIMATETRANSFORM',
]);

/** Normalize tagName to uppercase (SVG elements have lowercase tagName) */
function tagUpper(el) {
  return el.tagName.toUpperCase();
}

// --- Layout detection ---

function parsePx(val) {
  if (!val || val === 'auto' || val === 'none' || val === 'normal') return 0;
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
}

function parsePxRound(val) {
  return Math.round(parsePx(val));
}

function detectLayoutMode(cs, el) {
  const display = cs.display;

  // Flex containers
  if (display === 'flex' || display === 'inline-flex') {
    return cs.flexDirection === 'row' || cs.flexDirection === 'row-reverse'
      ? 'HORIZONTAL' : 'VERTICAL';
  }

  // Grid containers — detect from child positions since computed grid values are resolved pixels
  if (display === 'grid' || display === 'inline-grid') {
    return detectFromChildPositions(el) || 'VERTICAL';
  }

  // Table layouts
  if (display === 'table-row' || display === 'table-header-group' || display === 'table-row-group') return 'HORIZONTAL';
  if (display === 'table' || display === 'inline-table') return 'VERTICAL';

  // Block-level elements
  if (display === 'block' || display === 'flow-root' || display === 'list-item') {
    // Heuristic: if all visible children are side-by-side, treat as HORIZONTAL
    return detectFromChildPositions(el) || 'VERTICAL';
  }

  // display: contents — transparent wrapper, check children
  if (display === 'contents') {
    return detectFromChildPositions(el) || 'VERTICAL';
  }

  // Inline elements
  if (display === 'inline' || display === 'inline-block') {
    return detectFromChildPositions(el) || 'NONE';
  }

  return 'VERTICAL';
}

/**
 * Fallback: infer layout direction from child element positions.
 * Returns 'HORIZONTAL' if children are side-by-side, null otherwise.
 */
function detectFromChildPositions(el) {
  if (!el || !el.children || el.children.length < 2) return null;

  const visible = [];
  for (const child of Array.from(el.children)) {
    const cCs = window.getComputedStyle(child);
    if (cCs.display === 'none' || cCs.position === 'absolute' || cCs.position === 'fixed') continue;
    const r = child.getBoundingClientRect();
    if (r.width <= 0 && r.height <= 0) continue;
    visible.push(r);
    if (visible.length >= 4) break; // sample first few children
  }

  if (visible.length < 2) return null;

  // Check if children are arranged horizontally (similar top, spread across x)
  const tops = visible.map(r => r.top);
  const lefts = visible.map(r => r.left);
  const topSpread = Math.max(...tops) - Math.min(...tops);
  const leftSpread = Math.max(...lefts) - Math.min(...lefts);

  // Children are side-by-side if horizontal spread is significant and tops are aligned
  if (leftSpread > 20 && topSpread < Math.max(...visible.map(r => r.height)) * 0.5) {
    return 'HORIZONTAL';
  }

  return null;
}

function mapJustifyContent(val) {
  if (!val) return 'MIN';
  if (val.includes('space-between') || val.includes('space-around') || val.includes('space-evenly')) return 'SPACE_BETWEEN';
  if (val.includes('center')) return 'CENTER';
  if (val.includes('end') || val.includes('right')) return 'MAX';
  return 'MIN';
}

function mapAlignItems(val) {
  if (!val) return 'MIN';
  if (val.includes('center')) return 'CENTER';
  if (val.includes('end') || val.includes('bottom')) return 'MAX';
  return 'MIN';
}

function mapTextAlign(val) {
  if (val === 'center') return 'CENTER';
  if (val === 'right' || val === 'end') return 'RIGHT';
  if (val === 'justify') return 'JUSTIFIED';
  return 'LEFT';
}

// --- Color parsing ---

function parseCssColor(raw) {
  if (!raw || raw === 'transparent' || raw === 'rgba(0, 0, 0, 0)') return null;
  const rgba = raw.match(/rgba?\(\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\s*\)/);
  if (rgba) {
    return {
      r: parseFloat(rgba[1]) / 255,
      g: parseFloat(rgba[2]) / 255,
      b: parseFloat(rgba[3]) / 255,
      a: rgba[4] !== undefined ? parseFloat(rgba[4]) : 1,
    };
  }
  return null;
}

// --- Box shadow parsing ---

function parseBoxShadow(raw) {
  if (!raw || raw === 'none') return [];
  const shadows = [];
  const parts = raw.split(/,(?![^(]*\))/);
  for (const part of parts) {
    const trimmed = part.trim();
    const inset = trimmed.includes('inset');
    const cleaned = trimmed.replace(/inset/g, '').trim();
    const colorMatch = cleaned.match(/rgba?\([^)]+\)/);
    const color = colorMatch ? parseCssColor(colorMatch[0]) : { r: 0, g: 0, b: 0, a: 0.25 };
    const nums = cleaned.replace(/rgba?\([^)]+\)/, '').trim().split(/\s+/).map(parseFloat).filter(n => !isNaN(n));
    if (nums.length >= 2) {
      shadows.push({
        type: inset ? 'INNER_SHADOW' : 'DROP_SHADOW',
        color: color || { r: 0, g: 0, b: 0, a: 0.25 },
        offsetX: nums[0],
        offsetY: nums[1],
        blur: nums[2] || 0,
        spread: nums[3] || 0,
      });
    }
  }
  return shadows;
}

// --- SVG helpers ---

function isSvgElement(el) {
  return tagUpper(el) === 'SVG';
}

function isSvgChildElement(el) {
  return SVG_CHILD_TAGS.has(tagUpper(el));
}

function extractSvgContent(el) {
  const clone = el.cloneNode(true);
  if (!clone.getAttribute('xmlns')) clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  const rect = el.getBoundingClientRect();
  const viewBox = clone.getAttribute('viewBox');
  let w = rect.width, h = rect.height;
  if ((w === 0 || h === 0) && viewBox) {
    const parts = viewBox.split(/[\s,]+/).map(Number);
    if (parts.length === 4) { w = w || parts[2]; h = h || parts[3]; }
  }
  if (!clone.getAttribute('width') && w > 0) clone.setAttribute('width', String(Math.round(w)));
  if (!clone.getAttribute('height') && h > 0) clone.setAttribute('height', String(Math.round(h)));
  return clone.outerHTML;
}

function extractBgSvgDataUri(bgImage) {
  if (!bgImage || bgImage === 'none') return null;
  const match = bgImage.match(/url\(["']?(data:image\/svg\+xml[^"')]+)["']?\)/i);
  if (!match) return null;
  const dataUri = match[1];
  try {
    if (dataUri.includes(';base64,')) return atob(dataUri.split(';base64,')[1]);
    if (dataUri.includes(',')) return decodeURIComponent(dataUri.split(',').slice(1).join(','));
  } catch {}
  return null;
}

// --- Element classification ---

function classifyElement(el) {
  const tag = tagUpper(el);
  if (tag === 'SVG') return 'SVG';
  if (RECT_TAGS.has(tag)) return 'RECTANGLE';
  // Input/textarea/select with text content → TEXT node
  if ((tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') &&
      (el.value || el.placeholder || el.getAttribute('placeholder'))) return 'TEXT';
  if (isTextOnlyElement(el)) return 'TEXT';
  return 'FRAME';
}

function isTextOnlyElement(el) {
  const tag = tagUpper(el);
  const text = (el.textContent || '').trim();

  // Leaf text element — must have actual text content
  if (TEXT_TAGS.has(tag) && el.children.length === 0) {
    return text.length > 0;
  }

  // Parent with inline text children — only if there's actual text
  if (TEXT_TAGS.has(tag) && el.children.length > 0 && text.length > 0) {
    const allInlineText = Array.from(el.children).every(
      c => TEXT_TAGS.has(tagUpper(c)) && c.children.length === 0
    );
    if (allInlineText) return true;
  }

  // Generic element with text but no children
  if (el.children.length === 0 && text.length > 0 && !RECT_TAGS.has(tag)) return true;
  return false;
}

// --- Main walker ---

/** Counter for assigning unique IDs to elements needing screenshots */
let _h2fCounter = 0;

/**
 * Walk the DOM tree and produce a LayerNode.
 * Elements needing raster capture get a `data-h2f-id` attribute
 * so the caller (Puppeteer) can screenshot them individually.
 */
function walkDOM(el, parentRect, parentLayoutMode, parentAlignItems = 'normal', parentPaddingH = 0, parentPaddingV = 0) {
  const tag = tagUpper(el);
  const cs = window.getComputedStyle(el);
  const rect = el.getBoundingClientRect();

  const name = generateName(el);
  const rawNodeType = classifyElement(el);

  // --- SVG content (serialize the entire <svg> as one string) ---
  let svgContent;
  if (rawNodeType === 'SVG') {
    svgContent = extractSvgContent(el);
  } else if (rawNodeType !== 'TEXT' && el.children.length === 0) {
    svgContent = el.dataset?.bgSvg ?? extractBgSvgDataUri(cs.backgroundImage) ?? undefined;
  }

  const nodeType = rawNodeType === 'SVG' || (rawNodeType === 'FRAME' && svgContent != null)
    ? 'RECTANGLE' : rawNodeType;
  const layoutMode = nodeType === 'FRAME' ? detectLayoutMode(cs, el) : 'NONE';
  const flexWrap = cs.flexWrap;
  const layoutWrap = (flexWrap === 'wrap' || flexWrap === 'wrap-reverse') ? 'WRAP' : 'NO_WRAP';

  // --- Position ---
  const position = cs.position;
  const isAbsolute = position === 'absolute' || position === 'fixed';

  // --- Raster image marking ---
  let needsScreenshot = false;
  if (RASTER_TAGS.has(tag) && !svgContent) {
    needsScreenshot = true;
  } else if (rawNodeType !== 'TEXT' && rawNodeType !== 'SVG') {
    const bgImg = cs.backgroundImage;
    if (bgImg && bgImg !== 'none') {
      // Capture raster URL backgrounds and gradient backgrounds as screenshots.
      // SVG data-URI backgrounds are handled synchronously as svgContent (no screenshot needed).
      const isGradient = bgImg.includes('gradient(');
      const isRasterUrl = bgImg.includes('url(') && !bgImg.includes('svg');
      if (isGradient || isRasterUrl) needsScreenshot = true;
    }
  }

  let h2fId;
  if (needsScreenshot && rect.width > 0 && rect.height > 0) {
    h2fId = `h2f-${_h2fCounter++}`;
    el.setAttribute('data-h2f-id', h2fId);
  }

  // --- Colors ---
  const bgColor = parseCssColor(cs.backgroundColor);
  const textColor = parseCssColor(cs.color);

  // Per-side border detection: only include a side if border-style !== 'none' and width > 0
  const borderTopPx = cs.borderTopStyle !== 'none' ? parsePx(cs.borderTopWidth) : 0;
  const borderRightPx = cs.borderRightStyle !== 'none' ? parsePx(cs.borderRightWidth) : 0;
  const borderBottomPx = cs.borderBottomStyle !== 'none' ? parsePx(cs.borderBottomWidth) : 0;
  const borderLeftPx = cs.borderLeftStyle !== 'none' ? parsePx(cs.borderLeftWidth) : 0;
  const maxBorderWidth = Math.max(borderTopPx, borderRightPx, borderBottomPx, borderLeftPx);
  const activeBorderColorSrc =
    (borderTopPx > 0 && cs.borderTopColor) ||
    (borderRightPx > 0 && cs.borderRightColor) ||
    (borderBottomPx > 0 && cs.borderBottomColor) ||
    (borderLeftPx > 0 && cs.borderLeftColor) || '';
  const borderColor = activeBorderColorSrc ? parseCssColor(activeBorderColorSrc) : null;

  // --- Shadows ---
  const shadows = parseBoxShadow(cs.boxShadow);

  // --- Border radius ---
  const brTL = parsePxRound(cs.borderTopLeftRadius);
  const brTR = parsePxRound(cs.borderTopRightRadius);
  const brBL = parsePxRound(cs.borderBottomLeftRadius);
  const brBR = parsePxRound(cs.borderBottomRightRadius);
  const borderRadius = brTL === brTR && brTR === brBL && brBL === brBR
    ? brTL : [brTL, brTR, brBR, brBL];

  // --- Text ---
  const fontWeight = parseInt(cs.fontWeight) || 400;
  const fontSize = parsePx(cs.fontSize) || 16;
  const lineHeight = cs.lineHeight === 'normal' ? null : parsePx(cs.lineHeight);
  const fontFamily = cs.fontFamily.split(',')[0].replace(/['"]/g, '').trim() || 'Inter';
  const textAlignVal = mapTextAlign(cs.textAlign);
  const textDecoration = cs.textDecorationLine.includes('underline') ? 'UNDERLINE'
    : cs.textDecorationLine.includes('line-through') ? 'STRIKETHROUGH' : 'NONE';

  // Capture text: input/textarea placeholders first, then regular text elements
  let characters = '';
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
    characters = el.value || el.placeholder || el.getAttribute('placeholder') || '';
  } else if (nodeType === 'TEXT') {
    characters = el.innerText || getDirectTextContent(el);
  }

  // --- Children ---
  // Precompute this element's padding for passing to children
  const thisPaddingH = parsePx(cs.paddingLeft) + parsePx(cs.paddingRight);
  const thisPaddingV = parsePx(cs.paddingTop) + parsePx(cs.paddingBottom);
  const thisAlignItems = cs.alignItems;

  const children = [];
  if (nodeType === 'FRAME') {
    walkChildren(el, children, rect, layoutMode, cs, thisPaddingH, thisPaddingV, thisAlignItems);
  }

  /**
   * Recursively collect visual children, unwrapping display:contents elements.
   */
  function walkChildren(parent, out, parentRct, parentLayout, parentCs, paddingH, paddingV, alignItems) {
    for (const child of Array.from(parent.children)) {
      const childTag = tagUpper(child);

      // Skip non-visual tags
      if (SKIP_TAGS.has(childTag)) continue;

      // Skip SVG child elements (path, rect, circle, etc.) — they're part of parent SVG
      if (isSvgChildElement(child)) continue;

      const childCs = window.getComputedStyle(child);
      if (childCs.display === 'none') continue;

      // display:contents — unwrap: walk this element's children as if they were direct children
      if (childCs.display === 'contents') {
        walkChildren(child, out, parentRct, parentLayout, parentCs, paddingH, paddingV, alignItems);
        continue;
      }

      // Allow SVG elements and custom elements through even if zero-sized
      const isSvg = isSvgElement(child);
      const isCustomEl = childTag.includes('-');
      if (!isSvg && !isCustomEl && child.offsetWidth === 0 && child.offsetHeight === 0) continue;

      out.push(walkDOM(child, parentRct, parentLayout, alignItems, paddingH, paddingV));
    }
    // Direct text nodes
    for (const childNode of Array.from(parent.childNodes)) {
      if (childNode.nodeType === Node.TEXT_NODE) {
        const text = (childNode.textContent || '').trim();
        if (text.length > 0) out.push(createTextNode(text, parentCs));
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

  const fillWidth = inlineWidth === '100%' || el.getAttribute('width') === '100%' ||
    (hasFlexGrow && parentLayoutMode === 'HORIZONTAL') ||
    // Block-level children fill parent width ONLY when parent's cross-axis alignment
    // implies stretch (normal/stretch). If parent has align-items: center/flex-end,
    // children should NOT fill.
    (isBlockLevel && parentLayoutMode !== 'HORIZONTAL' && parentAlignIsStretch) ||
    fillsByWidthRatio;
  const fillHeight = inlineHeight === '100%' || el.getAttribute('height') === '100%' ||
    (hasFlexGrow && parentLayoutMode === 'VERTICAL') ||
    fillsByHeightRatio;

  // --- Opacity ---
  const parsedOpacity = parseFloat(cs.opacity);
  const opacity = isNaN(parsedOpacity) ? 1 : parsedOpacity;

  // --- Compute actual spacing from child positions ---
  // CSS gap only captures explicit gap; margins between children are missed.
  // Compute real spacing from actual child positions for accurate Figma auto-layout.
  let itemSpacing = parsePx(cs.gap) || (layoutMode === 'HORIZONTAL' ? parsePx(cs.columnGap) : parsePx(cs.rowGap)) || 0;
  let effectivePaddingTop = parsePx(cs.paddingTop);
  let effectivePaddingLeft = parsePx(cs.paddingLeft);

  if (layoutMode !== 'NONE' && children.length >= 1) {
    const flowChildren = children.filter(c => !c.isAbsolute);

    if (flowChildren.length >= 2 && itemSpacing === 0) {
      // Compute gaps between consecutive flow children
      const gaps = [];
      for (let i = 1; i < flowChildren.length; i++) {
        const prev = flowChildren[i - 1];
        const curr = flowChildren[i];
        const gap = layoutMode === 'VERTICAL'
          ? curr.y - (prev.y + prev.height)
          : curr.x - (prev.x + prev.width);
        if (gap > 0) gaps.push(Math.round(gap));
      }
      if (gaps.length > 0) {
        // Use the most common gap (mode) for uniform spacing
        const freq = {};
        let modeGap = gaps[0], modeCount = 0;
        for (const g of gaps) {
          freq[g] = (freq[g] || 0) + 1;
          if (freq[g] > modeCount) { modeCount = freq[g]; modeGap = g; }
        }
        itemSpacing = modeGap;
      }
    }

    // Detect effective padding from first child offset (includes child margin)
    if (flowChildren.length >= 1) {
      const first = flowChildren[0];
      if (layoutMode === 'VERTICAL' && first.y > effectivePaddingTop) {
        effectivePaddingTop = first.y;
      }
      if (layoutMode === 'HORIZONTAL' && first.x > effectivePaddingLeft) {
        effectivePaddingLeft = first.x;
      }
    }
  }

  const result = {
    type: nodeType,
    name,
    tag: el.tagName, // preserve original case for debugging
    width: Math.round(rect.width),
    height: Math.round(rect.height),
    x: Math.round(parentRect ? rect.left - parentRect.left : 0),
    y: Math.round(parentRect ? rect.top - parentRect.top : 0),
    backgroundColor: bgColor,
    borderColor: borderColor ? { r: borderColor.r, g: borderColor.g, b: borderColor.b } : null,
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
    textColor: textColor ? { r: textColor.r, g: textColor.g, b: textColor.b } : null,
    textAlign: textAlignVal,
    textDecoration,
    shadows,
    opacity,
    clipsContent: cs.overflow !== 'visible',
    visible: true,
    svgContent,
    _h2fId: h2fId,
    children,
  };

  // Log node info for debugging
  const fill = [fillWidth && 'W', fillHeight && 'H'].filter(Boolean).join('+');
  console.log(`[h2f-walker] ${name} → ${nodeType} ${result.width}x${result.height} ` +
    `${layoutMode !== 'NONE' ? layoutMode : ''} ${layoutWrap === 'WRAP' ? 'WRAP' : ''} ` +
    `${fill ? 'FILL:' + fill : ''} ${isAbsolute ? 'ABS' : ''} ` +
    `gap:${itemSpacing} pad:${effectivePaddingTop}/${parsePx(cs.paddingRight)}/${parsePx(cs.paddingBottom)}/${effectivePaddingLeft} ` +
    `children:${children.length}`);

  return result;
}

function getDirectTextContent(el) {
  let text = '';
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) text += node.textContent || '';
  }
  return text.trim() || el.innerText || '';
}

function generateName(el) {
  if (el.id) return `#${el.id}`;
  const className = el.className && typeof el.className === 'string' ? el.className : '';
  const classes = className.split(' ').filter(c => c.length > 0 && c.length < 30).slice(0, 2).join('.');
  if (classes) return `.${classes}`;
  const tag = tagUpper(el);
  if (tag === 'IMG') {
    const alt = el.getAttribute('alt');
    if (alt) return `img: ${alt.slice(0, 30)}`;
    const src = el.getAttribute('src');
    if (src) { const f = src.split('/').pop()?.split('?')[0]; if (f) return `img: ${f.slice(0, 30)}`; }
  }
  return el.tagName.toLowerCase();
}

function createTextNode(text, parentCs) {
  const textColor = parseCssColor(parentCs.color);
  return {
    type: 'TEXT',
    name: text.slice(0, 20),
    tag: '#text',
    width: 0, height: 0, x: 0, y: 0,
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
    paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0,
    primaryAxisAlign: 'MIN',
    counterAxisAlign: 'MIN',
    fillWidth: false,
    fillHeight: false,
    isAbsolute: false,
    characters: text,
    fontFamily: parentCs.fontFamily.split(',')[0].replace(/['"]/g, '').trim() || 'Inter',
    fontWeight: parseInt(parentCs.fontWeight) || 400,
    fontSize: parseFloat(parentCs.fontSize) || 16,
    lineHeight: parentCs.lineHeight === 'normal' ? null : parseFloat(parentCs.lineHeight),
    textColor: textColor ? { r: textColor.r, g: textColor.g, b: textColor.b } : null,
    textAlign: 'LEFT',
    textDecoration: 'NONE',
    shadows: [],
    opacity: 1,
    clipsContent: false,
    visible: true,
    children: [],
  };
}
