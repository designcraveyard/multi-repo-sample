import type { LayerNode } from '../parser/types';
import { getFontStyle, normalizeFontFamily } from '../utils/font';

// --- Font loading cache ---

const loadedFonts = new Set<string>();
const FALLBACK_FONT: FontName = { family: 'Inter', style: 'Regular' };

async function loadFont(family: string, style: string): Promise<FontName> {
  // Guard against empty font names (causes "Ignoring fontName with empty key" in Figma)
  if (!family || !style) return await loadFont(FALLBACK_FONT.family, FALLBACK_FONT.style);

  const key = `${family}|${style}`;
  if (loadedFonts.has(key)) return { family, style };

  // Try exact match
  try {
    await figma.loadFontAsync({ family, style });
    loadedFonts.add(key);
    return { family, style };
  } catch (_e) {
    // fall through
  }

  // Try Regular style of same family
  const regKey = `${family}|Regular`;
  if (!loadedFonts.has(regKey)) {
    try {
      await figma.loadFontAsync({ family, style: 'Regular' });
      loadedFonts.add(regKey);
      return { family, style: 'Regular' };
    } catch (_e) {
      // fall through
    }
  } else {
    return { family, style: 'Regular' };
  }

  // Fall back to Inter Regular
  if (!loadedFonts.has('Inter|Regular')) {
    await figma.loadFontAsync(FALLBACK_FONT);
    loadedFonts.add('Inter|Regular');
  }
  return FALLBACK_FONT;
}

// --- Public API ---

/**
 * Convert a LayerNode tree into Figma nodes.
 * Returns the root FrameNode.
 */
export async function convertTree(
  root: LayerNode,
  onProgress?: (current: number, total: number) => void
): Promise<FrameNode> {
  const totalNodes = countNodes(root);
  let processedNodes = 0;

  console.log('[h2f] convertTree start', {
    totalNodes,
    rootType: root.type,
    rootName: root.name,
    rootSize: `${root.width}x${root.height}`,
    rootLayout: root.layoutMode,
    rootWrap: root.layoutWrap,
  });

  // Pre-load all unique fonts
  const fonts = collectFonts(root);
  console.log('[h2f] Loading fonts:', fonts.map(f => `${f.family}|${f.style}`));
  for (const { family, style } of fonts) {
    await loadFont(family, style);
  }

  const rootFrame = (await createNode(root, null, true, () => {
    processedNodes++;
    onProgress?.(processedNodes, totalNodes);
  })) as FrameNode;

  // Root frame: verify FIXED dimensions match measured HTML size
  // (should already be set correctly in createFrameNode)
  console.log('[h2f] Root frame final:', rootFrame.width, 'x', rootFrame.height,
    'expected:', root.width, 'x', root.height);

  // Smart positioning: place next to existing content
  let maxRight = 0;
  for (const child of figma.currentPage.children) {
    if (child === rootFrame) continue;
    const right = child.x + child.width;
    if (right > maxRight) maxRight = right;
  }
  rootFrame.x = Math.round(maxRight + 100);
  rootFrame.y = 0;

  figma.viewport.scrollAndZoomIntoView([rootFrame]);
  return rootFrame;
}

// --- Node Creation ---

const BATCH_SIZE = 50;
let batchCounter = 0;

async function yieldIfNeeded(): Promise<void> {
  batchCounter++;
  if (batchCounter >= BATCH_SIZE) {
    batchCounter = 0;
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
}

async function createNode(
  layer: LayerNode,
  parent: FrameNode | null,
  isRoot: boolean,
  onNode: () => void
): Promise<SceneNode> {
  await yieldIfNeeded();

  console.log('[h2f] createNode', {
    type: layer.type,
    name: layer.name,
    size: `${layer.width}x${layer.height}`,
    pos: `${layer.x},${layer.y}`,
    layout: layer.layoutMode,
    wrap: layer.layoutWrap,
    fillW: layer.fillWidth,
    fillH: layer.fillHeight,
    abs: layer.isAbsolute,
    children: layer.children.length,
  });

  let node: SceneNode;

  switch (layer.type) {
    case 'TEXT':
      node = await createTextNode(layer);
      break;
    case 'RECTANGLE':
      if (layer.svgContent) {
        node = createSvgNode(layer);
      } else if (layer.imageData) {
        node = await createImageNode(layer);
      } else {
        node = createRectangleNode(layer);
      }
      break;
    case 'FRAME':
    default:
      node = await createFrameNode(layer, isRoot, onNode);
      break;
  }

  // Common properties
  node.name = layer.name;
  if (layer.opacity < 1 && 'opacity' in node) {
    (node as FrameNode).opacity = layer.opacity;
  }

  // Append to parent, then set sizing (sizing MUST be set after appending)
  if (parent) {
    parent.appendChild(node);

    if (parent.layoutMode !== 'NONE') {
      // Absolutely positioned children: take out of auto-layout flow
      if (layer.isAbsolute) {
        (node as FrameNode).layoutPositioning = 'ABSOLUTE';
        node.x = layer.x;
        node.y = layer.y;
      } else {
        // Set fill/hug sizing using the shorthand API (set AFTER appending)
        applyChildSizing(node, layer, parent.layoutMode);
      }
    } else {
      // Parent has NO auto-layout — position children with x/y
      node.x = layer.x;
      node.y = layer.y;
    }
  }

  onNode();
  return node;
}

/**
 * Apply sizing to a child after it's appended to an auto-layout parent.
 * Uses the layoutSizingHorizontal/layoutSizingVertical shorthand API.
 *
 * Key rules for pixel-perfect conversion:
 * - FRAME/RECTANGLE: FILL on width/height as detected by the walker
 * - TEXT: only FILL horizontally if the text is actually multi-line.
 *   Single-line text stays WIDTH_AND_HEIGHT auto-resize to avoid wrapping
 *   caused by Figma/Chrome font metric differences.
 */
function applyChildSizing(
  node: SceneNode,
  layer: LayerNode,
  _parentLayoutMode: string
): void {
  const isFrame = node.type === 'FRAME';
  const isText = node.type === 'TEXT';
  const isRect = node.type === 'RECTANGLE' || node.type === 'ELLIPSE';

  // All node types in auto-layout support layoutSizingHorizontal/Vertical
  if (isFrame || isText || isRect) {
    const sizableNode = node as FrameNode | TextNode | RectangleNode;

    if (layer.fillWidth) {
      if (isText) {
        // Only FILL text that is actually multi-line — single-line text should
        // auto-size to avoid wrapping from font metric differences.
        const effectiveLineHeight = layer.lineHeight || layer.fontSize * 1.2;
        const isMultiLine = layer.height > effectiveLineHeight * 1.4;
        if (isMultiLine) {
          console.log('[h2f] → FILL horizontal (multiline text):', layer.name);
          sizableNode.layoutSizingHorizontal = 'FILL';
          (node as TextNode).textAutoResize = 'HEIGHT';
        }
        // Single-line text: keep WIDTH_AND_HEIGHT from createTextNode
      } else {
        console.log('[h2f] → FILL horizontal:', layer.name, `(${node.type})`);
        sizableNode.layoutSizingHorizontal = 'FILL';
      }
    }

    if (layer.fillHeight) {
      if (isFrame || isRect) {
        console.log('[h2f] → FILL vertical:', layer.name, `(${node.type})`);
        sizableNode.layoutSizingVertical = 'FILL';
      }
    }
  }
}

async function createFrameNode(
  layer: LayerNode,
  isRoot: boolean,
  onNode: () => void
): Promise<FrameNode> {
  const frame = figma.createFrame();

  // Step 1: Set visual properties first
  // Background fill — prefer imageData (gradient screenshot) over solid color
  if (layer.imageData) {
    try {
      const bytes = figma.base64Decode(layer.imageData);
      const image = figma.createImage(bytes);
      frame.fills = [{ type: 'IMAGE', imageHash: image.hash, scaleMode: 'FILL' }];
    } catch (_e) {
      frame.fills = layer.backgroundColor && layer.backgroundColor.a > 0
        ? [{ type: 'SOLID', color: { r: layer.backgroundColor.r, g: layer.backgroundColor.g, b: layer.backgroundColor.b }, opacity: layer.backgroundColor.a }]
        : [];
    }
  } else if (layer.backgroundColor && layer.backgroundColor.a > 0) {
    frame.fills = [
      {
        type: 'SOLID',
        color: {
          r: layer.backgroundColor.r,
          g: layer.backgroundColor.g,
          b: layer.backgroundColor.b,
        },
        opacity: layer.backgroundColor.a,
      },
    ];
  } else {
    frame.fills = [];
  }

  // Per-side border strokes
  if (layer.borderColor && layer.borderWidth > 0) {
    frame.strokes = [{ type: 'SOLID', color: layer.borderColor }];
    const t = layer.borderTopWidth ?? layer.borderWidth;
    const r = layer.borderRightWidth ?? layer.borderWidth;
    const b = layer.borderBottomWidth ?? layer.borderWidth;
    const l = layer.borderLeftWidth ?? layer.borderWidth;
    const uniform = t === r && r === b && b === l;
    if (uniform) {
      frame.strokeWeight = t;
    } else {
      frame.strokeTopWeight = t;
      frame.strokeRightWeight = r;
      frame.strokeBottomWeight = b;
      frame.strokeLeftWeight = l;
    }
  }

  // Corner radius
  if (Array.isArray(layer.borderRadius)) {
    frame.topLeftRadius = layer.borderRadius[0];
    frame.topRightRadius = layer.borderRadius[1];
    frame.bottomRightRadius = layer.borderRadius[2];
    frame.bottomLeftRadius = layer.borderRadius[3];
  } else if (layer.borderRadius > 0) {
    frame.cornerRadius = layer.borderRadius;
  }

  // Step 2: Set layoutMode BEFORE any layout properties
  if (layer.layoutMode !== 'NONE') {
    frame.layoutMode = layer.layoutMode;

    console.log('[h2f] createFrame', layer.name, {
      layout: layer.layoutMode,
      wrap: layer.layoutWrap,
      isRoot,
      gap: layer.itemSpacing,
      padding: `${layer.paddingTop} ${layer.paddingRight} ${layer.paddingBottom} ${layer.paddingLeft}`,
      primaryAlign: layer.primaryAxisAlign,
      counterAlign: layer.counterAxisAlign,
      size: `${layer.width}x${layer.height}`,
    });

    // Step 3: Set layout properties (only valid after layoutMode is set)
    if (layer.layoutWrap === 'WRAP') {
      frame.layoutWrap = 'WRAP';
    }
    frame.itemSpacing = layer.itemSpacing;
    frame.paddingTop = layer.paddingTop;
    frame.paddingRight = layer.paddingRight;
    frame.paddingBottom = layer.paddingBottom;
    frame.paddingLeft = layer.paddingLeft;
    frame.primaryAxisAlignItems = layer.primaryAxisAlign;
    frame.counterAxisAlignItems = layer.counterAxisAlign;

    // Step 4: Frame sizing — FIXED on BOTH axes for pixel-perfect dimensions.
    // Using HUG causes Figma to recompute sizes from children, which can diverge
    // from the browser's layout due to rounding, font metrics, and margin collapse.
    // FIXED ensures every frame matches the exact browser-measured dimensions.
    // FILL children still work correctly inside FIXED parents.
    frame.layoutSizingHorizontal = 'FIXED';
    frame.layoutSizingVertical = 'FIXED';

    // Step 5: resize to exact browser-measured dimensions
    const w = Math.max(layer.width, 1);
    const h = Math.max(layer.height, 1);
    frame.resize(w, h);
  } else {
    // No auto-layout — just set fixed dimensions
    frame.resize(Math.max(layer.width, 1), Math.max(layer.height, 1));
  }

  // Clipping
  frame.clipsContent = layer.clipsContent;

  // Effects (shadows) — guard spread for frames without visible fills
  if (layer.shadows.length > 0) {
    const fills = frame.fills;
    const hasFills = Array.isArray(fills) && fills.length > 0;
    frame.effects = layer.shadows.map((s) => ({
      type: s.type,
      color: { r: s.color.r, g: s.color.g, b: s.color.b, a: s.color.a },
      offset: { x: s.offsetX, y: s.offsetY },
      radius: s.blur,
      spread: hasFills ? s.spread : 0,
      visible: true,
      blendMode: 'NORMAL' as const,
    } as DropShadowEffect | InnerShadowEffect));
  }

  // Step 6: Create children recursively (AFTER layout is configured)
  for (const child of layer.children) {
    await createNode(child, frame, false, onNode);
  }

  return frame;
}

async function createTextNode(layer: LayerNode): Promise<TextNode> {
  const text = figma.createText();

  const family = normalizeFontFamily(layer.fontFamily);
  const style = getFontStyle(layer.fontWeight, family);
  const fontName = await loadFont(family, style);

  text.fontName = fontName;
  text.fontSize = Math.max(layer.fontSize, 1);
  text.characters = layer.characters || ' ';

  // Text color
  if (layer.textColor) {
    text.fills = [{ type: 'SOLID', color: layer.textColor }];
  }

  // Line height
  if (layer.lineHeight !== null && layer.lineHeight > 0) {
    text.lineHeight = { value: layer.lineHeight, unit: 'PIXELS' };
  }

  // Text alignment
  text.textAlignHorizontal = layer.textAlign;

  // Text decoration
  if (layer.textDecoration === 'UNDERLINE') {
    text.textDecoration = 'UNDERLINE';
  } else if (layer.textDecoration === 'STRIKETHROUGH') {
    text.textDecoration = 'STRIKETHROUGH';
  }

  // Smart text sizing: only constrain width for text that actually wraps (multiline).
  // Single-line text should use WIDTH_AND_HEIGHT (auto-size) because Figma's font
  // metrics may differ slightly from the browser, causing short text like "9:41" to
  // wrap prematurely if constrained to the exact browser-measured width.
  // Note: fillWidth children will be overridden to FILL by applyChildSizing later.
  const effectiveLineHeight = layer.lineHeight || layer.fontSize * 1.2;
  const isMultiLine = layer.height > effectiveLineHeight * 1.4;

  if (layer.width > 0 && isMultiLine) {
    // Multi-line text: constrain to measured width, let height auto-adjust
    text.resize(layer.width, Math.max(layer.height, 1));
    text.textAutoResize = 'HEIGHT';
  } else {
    // Single-line text: auto-size both dimensions
    text.textAutoResize = 'WIDTH_AND_HEIGHT';
  }

  return text;
}

function createSvgNode(layer: LayerNode): SceneNode {
  try {
    const svgNode = figma.createNodeFromSvg(layer.svgContent!);
    // Resize to match the original element dimensions
    if (layer.width > 0 && layer.height > 0) {
      svgNode.resize(layer.width, layer.height);
    }
    return svgNode;
  } catch (_e) {
    // If SVG parsing fails, fall back to a placeholder rectangle
    return createRectangleNode(layer);
  }
}

async function createImageNode(layer: LayerNode): Promise<RectangleNode> {
  const rect = figma.createRectangle();
  rect.resize(Math.max(layer.width, 1), Math.max(layer.height, 1));

  try {
    const bytes = figma.base64Decode(layer.imageData!);
    const image = figma.createImage(bytes);
    rect.fills = [
      {
        type: 'IMAGE',
        imageHash: image.hash,
        scaleMode: 'FILL',
      },
    ];
  } catch (_e) {
    // Fallback to placeholder if image decoding fails
    rect.fills = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 } }];
  }

  // Corner radius
  if (Array.isArray(layer.borderRadius)) {
    rect.topLeftRadius = layer.borderRadius[0];
    rect.topRightRadius = layer.borderRadius[1];
    rect.bottomRightRadius = layer.borderRadius[2];
    rect.bottomLeftRadius = layer.borderRadius[3];
  } else if (layer.borderRadius > 0) {
    rect.cornerRadius = layer.borderRadius;
  }

  // Per-side border strokes
  if (layer.borderColor && layer.borderWidth > 0) {
    rect.strokes = [{ type: 'SOLID', color: layer.borderColor }];
    const t = layer.borderTopWidth ?? layer.borderWidth;
    const r2 = layer.borderRightWidth ?? layer.borderWidth;
    const b = layer.borderBottomWidth ?? layer.borderWidth;
    const l = layer.borderLeftWidth ?? layer.borderWidth;
    if (t === r2 && r2 === b && b === l) {
      rect.strokeWeight = t;
    } else {
      rect.strokeTopWeight = t;
      rect.strokeRightWeight = r2;
      rect.strokeBottomWeight = b;
      rect.strokeLeftWeight = l;
    }
  }

  return rect;
}

function createRectangleNode(layer: LayerNode): RectangleNode {
  const rect = figma.createRectangle();

  rect.resize(Math.max(layer.width, 1), Math.max(layer.height, 1));

  if (layer.backgroundColor && layer.backgroundColor.a > 0) {
    rect.fills = [
      {
        type: 'SOLID',
        color: {
          r: layer.backgroundColor.r,
          g: layer.backgroundColor.g,
          b: layer.backgroundColor.b,
        },
        opacity: layer.backgroundColor.a,
      },
    ];
  } else {
    // Placeholder gray for images/media
    rect.fills = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 } }];
  }

  // Corner radius
  if (Array.isArray(layer.borderRadius)) {
    rect.topLeftRadius = layer.borderRadius[0];
    rect.topRightRadius = layer.borderRadius[1];
    rect.bottomRightRadius = layer.borderRadius[2];
    rect.bottomLeftRadius = layer.borderRadius[3];
  } else if (layer.borderRadius > 0) {
    rect.cornerRadius = layer.borderRadius;
  }

  // Per-side border strokes
  if (layer.borderColor && layer.borderWidth > 0) {
    rect.strokes = [{ type: 'SOLID', color: layer.borderColor }];
    const t = layer.borderTopWidth ?? layer.borderWidth;
    const r = layer.borderRightWidth ?? layer.borderWidth;
    const b = layer.borderBottomWidth ?? layer.borderWidth;
    const l = layer.borderLeftWidth ?? layer.borderWidth;
    if (t === r && r === b && b === l) {
      rect.strokeWeight = t;
    } else {
      rect.strokeTopWeight = t;
      rect.strokeRightWeight = r;
      rect.strokeBottomWeight = b;
      rect.strokeLeftWeight = l;
    }
  }

  return rect;
}

// --- Utilities ---

function collectFonts(
  node: LayerNode
): Array<{ family: string; style: string }> {
  const fonts = new Map<string, { family: string; style: string }>();

  function walk(n: LayerNode) {
    if (n.type === 'TEXT' || n.fontFamily) {
      const family = normalizeFontFamily(n.fontFamily);
      const style = getFontStyle(n.fontWeight, family);
      fonts.set(`${family}|${style}`, { family, style });
    }
    n.children.forEach(walk);
  }
  walk(node);

  fonts.set('Inter|Regular', { family: 'Inter', style: 'Regular' });
  return Array.from(fonts.values());
}

function countNodes(node: LayerNode): number {
  return 1 + node.children.reduce((sum, c) => sum + countNodes(c), 0);
}
