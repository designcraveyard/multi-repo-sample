import type { FigmaColorWithAlpha } from '../parser/types';

const NAMED_COLORS: Record<string, string> = {
  transparent: '#00000000', black: '#000000', white: '#ffffff',
  red: '#ff0000', green: '#008000', blue: '#0000ff', yellow: '#ffff00',
  cyan: '#00ffff', magenta: '#ff00ff', orange: '#ffa500', purple: '#800080',
  pink: '#ffc0cb', gray: '#808080', grey: '#808080',
  silver: '#c0c0c0', maroon: '#800000', olive: '#808000', lime: '#00ff00',
  aqua: '#00ffff', teal: '#008080', navy: '#000080', fuchsia: '#ff00ff',
  coral: '#ff7f50', salmon: '#fa8072', tomato: '#ff6347',
  gold: '#ffd700', khaki: '#f0e68c', plum: '#dda0dd',
  orchid: '#da70d6', violet: '#ee82ee', indigo: '#4b0082',
  turquoise: '#40e0d0', tan: '#d2b48c', sienna: '#a0522d',
  chocolate: '#d2691e', firebrick: '#b22222', crimson: '#dc143c',
  darkred: '#8b0000', darkgreen: '#006400', darkblue: '#00008b',
  darkgray: '#a9a9a9', darkgrey: '#a9a9a9', darkkhaki: '#bdb76b',
  darkorange: '#ff8c00', darkorchid: '#9932cc', darksalmon: '#e9967a',
  darkviolet: '#9400d3', deeppink: '#ff1493', deepskyblue: '#00bfff',
  dodgerblue: '#1e90ff', forestgreen: '#228b22', gainsboro: '#dcdcdc',
  ghostwhite: '#f8f8ff', goldenrod: '#daa520', greenyellow: '#adff2f',
  honeydew: '#f0fff0', hotpink: '#ff69b4', indianred: '#cd5c5c',
  ivory: '#fffff0', lavender: '#e6e6fa', lawngreen: '#7cfc00',
  lemonchiffon: '#fffacd', lightblue: '#add8e6', lightcoral: '#f08080',
  lightcyan: '#e0ffff', lightgray: '#d3d3d3', lightgrey: '#d3d3d3',
  lightgreen: '#90ee90', lightpink: '#ffb6c1', lightsalmon: '#ffa07a',
  lightskyblue: '#87cefa', lightsteelblue: '#b0c4de', lightyellow: '#ffffe0',
  limegreen: '#32cd32', linen: '#faf0e6', mediumaquamarine: '#66cdaa',
  mediumblue: '#0000cd', mediumorchid: '#ba55d3', mediumpurple: '#9370db',
  mediumseagreen: '#3cb371', mediumslateblue: '#7b68ee',
  mediumspringgreen: '#00fa9a', mediumturquoise: '#48d1cc',
  mediumvioletred: '#c71585', midnightblue: '#191970',
  mintcream: '#f5fffa', mistyrose: '#ffe4e1', moccasin: '#ffe4b5',
  navajowhite: '#ffdead', oldlace: '#fdf5e6', olivedrab: '#6b8e23',
  orangered: '#ff4500', palegoldenrod: '#eee8aa', palegreen: '#98fb98',
  paleturquoise: '#afeeee', palevioletred: '#db7093', papayawhip: '#ffefd5',
  peachpuff: '#ffdab9', peru: '#cd853f', powderblue: '#b0e0e6',
  rosybrown: '#bc8f8f', royalblue: '#4169e1', saddlebrown: '#8b4513',
  sandybrown: '#f4a460', seagreen: '#2e8b57', seashell: '#fff5ee',
  skyblue: '#87ceeb', slateblue: '#6a5acd', slategray: '#708090',
  slategrey: '#708090', snow: '#fffafa', springgreen: '#00ff7f',
  steelblue: '#4682b4', thistle: '#d8bfd8', wheat: '#f5deb3',
  whitesmoke: '#f5f5f5', yellowgreen: '#9acd32',
  aliceblue: '#f0f8ff', antiquewhite: '#faebd7', aquamarine: '#7fffd4',
  azure: '#f0ffff', beige: '#f5f5dc', bisque: '#ffe4c4',
  blanchedalmond: '#ffebcd', blueviolet: '#8a2be2', burlywood: '#deb887',
  cadetblue: '#5f9ea0', chartreuse: '#7fff00', cornflowerblue: '#6495ed',
  cornsilk: '#fff8dc', darkslategray: '#2f4f4f', darkslategrey: '#2f4f4f',
  darkturquoise: '#00ced1', dimgray: '#696969', dimgrey: '#696969',
  floralwhite: '#fffaf0',
};

export function parseCssColor(value: string): FigmaColorWithAlpha | null {
  if (!value || value === 'transparent' || value === 'rgba(0, 0, 0, 0)') {
    return null;
  }

  const lower = value.toLowerCase().trim();

  if (NAMED_COLORS[lower]) {
    return parseHex(NAMED_COLORS[lower]);
  }

  if (lower.startsWith('#')) {
    return parseHex(lower);
  }

  // rgb() / rgba() — supports both comma and space syntax
  const rgbMatch = lower.match(
    /rgba?\(\s*([\d.]+)[,%\s]+([\d.]+)[,%\s]+([\d.]+)(?:[,/\s]+([\d.]+%?))?\s*\)/
  );
  if (rgbMatch) {
    return {
      r: parseFloat(rgbMatch[1]) / 255,
      g: parseFloat(rgbMatch[2]) / 255,
      b: parseFloat(rgbMatch[3]) / 255,
      a: rgbMatch[4] !== undefined
        ? rgbMatch[4].endsWith('%')
          ? parseFloat(rgbMatch[4]) / 100
          : parseFloat(rgbMatch[4])
        : 1,
    };
  }

  // hsl() / hsla()
  const hslMatch = lower.match(
    /hsla?\(\s*([\d.]+)[,\s]+([\d.]+)%[,\s]+([\d.]+)%(?:[,/\s]+([\d.]+%?))?\s*\)/
  );
  if (hslMatch) {
    return hslToRgb(
      parseFloat(hslMatch[1]),
      parseFloat(hslMatch[2]),
      parseFloat(hslMatch[3]),
      hslMatch[4] !== undefined
        ? hslMatch[4].endsWith('%')
          ? parseFloat(hslMatch[4]) / 100
          : parseFloat(hslMatch[4])
        : 1
    );
  }

  return null;
}

function parseHex(hex: string): FigmaColorWithAlpha {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  if (h.length === 4)
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];

  return {
    r: parseInt(h.slice(0, 2), 16) / 255,
    g: parseInt(h.slice(2, 4), 16) / 255,
    b: parseInt(h.slice(4, 6), 16) / 255,
    a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1,
  };
}

function hslToRgb(
  h: number,
  s: number,
  l: number,
  a: number
): FigmaColorWithAlpha {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const f = (n: number) =>
    l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return { r: f(0), g: f(8), b: f(4), a };
}
