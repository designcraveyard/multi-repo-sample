/** Figma-compatible color in 0-1 range */
export interface FigmaColor {
  r: number;
  g: number;
  b: number;
}

export interface FigmaColorWithAlpha extends FigmaColor {
  a: number;
}

/** Shadow / effect representation */
export interface ShadowEffect {
  type: 'DROP_SHADOW' | 'INNER_SHADOW';
  color: FigmaColorWithAlpha;
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
}

/**
 * Intermediate representation for a single node.
 * Produced by the UI-thread parser, consumed by the main-thread converter.
 * Serialized as JSON via postMessage.
 */
export interface LayerNode {
  type: 'FRAME' | 'TEXT' | 'RECTANGLE';
  name: string;
  tag: string;

  // --- Dimensions ---
  width: number;
  height: number;

  // --- Position (relative to parent) ---
  x: number;
  y: number;

  // --- Background ---
  backgroundColor: FigmaColorWithAlpha | null;

  // --- Border ---
  borderColor: FigmaColor | null;
  /** Uniform border width (legacy — prefer per-side fields below) */
  borderWidth: number;
  borderTopWidth: number;
  borderRightWidth: number;
  borderBottomWidth: number;
  borderLeftWidth: number;
  borderRadius: number | [number, number, number, number];

  // --- Layout (FRAME nodes) ---
  layoutMode: 'HORIZONTAL' | 'VERTICAL' | 'NONE';
  layoutWrap: 'NO_WRAP' | 'WRAP';
  itemSpacing: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  primaryAxisAlign: 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN';
  counterAxisAlign: 'MIN' | 'CENTER' | 'MAX';

  // --- Sizing ---
  fillWidth: boolean;
  fillHeight: boolean;

  // --- Positioning ---
  isAbsolute: boolean; // CSS position: absolute or fixed

  // --- Text (TEXT nodes) ---
  characters: string;
  fontFamily: string;
  fontWeight: number;
  fontSize: number;
  lineHeight: number | null;
  textColor: FigmaColor | null;
  textAlign: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED';
  textDecoration: 'NONE' | 'UNDERLINE' | 'STRIKETHROUGH';

  // --- Effects ---
  shadows: ShadowEffect[];
  opacity: number;

  // --- Behavior ---
  clipsContent: boolean;
  visible: boolean;

  // --- SVG ---
  svgContent?: string;

  // --- Raster image (base64 PNG from Puppeteer screenshot) ---
  imageData?: string;

  // --- Children ---
  children: LayerNode[];
}
