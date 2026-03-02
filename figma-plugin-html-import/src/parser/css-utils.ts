/** Parse a CSS px/number value. Returns 0 for non-numeric values. */
export function parsePx(value: string): number {
  if (!value || value === 'auto' || value === 'none' || value === 'normal') return 0;
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
}

/** Parse CSS box-shadow into individual shadow objects */
export function parseBoxShadow(
  value: string
): Array<{
  inset: boolean;
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
  color: string;
}> {
  if (!value || value === 'none') return [];

  const shadows = splitOutsideParens(value, ',');

  return shadows.map((shadow) => {
    const trimmed = shadow.trim();
    const inset = trimmed.includes('inset');
    const cleaned = trimmed.replace('inset', '').trim();

    // Extract color (rgb/rgba/hex/named) — appears at start or end
    const colorMatch = cleaned.match(
      /(rgba?\([^)]+\)|hsla?\([^)]+\)|#[0-9a-fA-F]+)\s*/
    );
    const color = colorMatch ? colorMatch[1] : 'rgba(0,0,0,0.25)';
    const rest = cleaned.replace(color, '').trim();
    const nums = rest.split(/\s+/).map(parsePx);

    return {
      inset,
      offsetX: nums[0] || 0,
      offsetY: nums[1] || 0,
      blur: nums[2] || 0,
      spread: nums[3] || 0,
      color,
    };
  });
}

/** Detect flex/block/grid layout from computed style and element children */
export function detectLayoutMode(
  cs: CSSStyleDeclaration,
  el?: HTMLElement
): 'HORIZONTAL' | 'VERTICAL' | 'NONE' {
  const display = cs.display;

  // Flex containers — direction is explicit from flexDirection
  if (display === 'flex' || display === 'inline-flex') {
    const dir = cs.flexDirection;
    if (dir === 'row' || dir === 'row-reverse') return 'HORIZONTAL';
    return 'VERTICAL';
  }

  // Grid containers — infer direction from child positions since resolved grid values are pixels
  if (display === 'grid' || display === 'inline-grid') {
    return (el ? detectFromChildPositions(el) : null) || 'VERTICAL';
  }

  // Table layouts
  if (display === 'table-row' || display === 'table-header-group' || display === 'table-row-group') return 'HORIZONTAL';
  if (display === 'table' || display === 'inline-table') return 'VERTICAL';

  // Block-level: heuristic — check if children are side-by-side
  if (display === 'block' || display === 'list-item' || display === 'flow-root') {
    return (el ? detectFromChildPositions(el) : null) || 'VERTICAL';
  }

  // display: contents — transparent wrapper, default to VERTICAL
  if (display === 'contents') return 'VERTICAL';

  // Inline elements — check child positions, default NONE
  if (display === 'inline' || display === 'inline-block') {
    return (el ? detectFromChildPositions(el) : null) || 'NONE';
  }

  return 'NONE';
}

/**
 * Infer layout direction from child element positions.
 * Returns 'HORIZONTAL' if children are predominantly side-by-side, null otherwise.
 */
function detectFromChildPositions(el: HTMLElement): 'HORIZONTAL' | null {
  if (!el.children || el.children.length < 2) return null;

  const visible: DOMRect[] = [];
  for (const child of Array.from(el.children).slice(0, 4)) {
    const childEl = child as HTMLElement;
    const childCs = window.getComputedStyle(childEl);
    if (childCs.display === 'none' || childCs.position === 'absolute' || childCs.position === 'fixed') continue;
    const r = childEl.getBoundingClientRect();
    if (r.width <= 0 && r.height <= 0) continue;
    visible.push(r);
  }

  if (visible.length < 2) return null;

  const tops = visible.map((r) => r.top);
  const lefts = visible.map((r) => r.left);
  const topSpread = Math.max(...tops) - Math.min(...tops);
  const leftSpread = Math.max(...lefts) - Math.min(...lefts);
  const maxHeight = Math.max(...visible.map((r) => r.height));

  // Children are side-by-side if horizontal spread is significant and tops are roughly aligned
  if (leftSpread > 20 && topSpread < maxHeight * 0.5) return 'HORIZONTAL';
  return null;
}

/** Map CSS justify-content to Figma primaryAxisAlignItems */
export function mapJustifyContent(
  value: string
): 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN' {
  switch (value) {
    case 'center':
      return 'CENTER';
    case 'flex-end':
    case 'end':
      return 'MAX';
    case 'space-between':
      return 'SPACE_BETWEEN';
    case 'space-around':
    case 'space-evenly':
      return 'SPACE_BETWEEN';
    default:
      return 'MIN';
  }
}

/** Map CSS align-items to Figma counterAxisAlignItems */
export function mapAlignItems(value: string): 'MIN' | 'CENTER' | 'MAX' {
  switch (value) {
    case 'center':
      return 'CENTER';
    case 'flex-end':
    case 'end':
      return 'MAX';
    default:
      return 'MIN';
  }
}

/** Map CSS text-align to Figma textAlignHorizontal */
export function mapTextAlign(
  value: string
): 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED' {
  switch (value) {
    case 'center':
      return 'CENTER';
    case 'right':
    case 'end':
      return 'RIGHT';
    case 'justify':
      return 'JUSTIFIED';
    default:
      return 'LEFT';
  }
}

function splitOutsideParens(str: string, delimiter: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const char of str) {
    if (char === '(') depth++;
    if (char === ')') depth--;
    if (char === delimiter && depth === 0) {
      parts.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  if (current) parts.push(current);
  return parts;
}
