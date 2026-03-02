/**
 * Map CSS font-weight number to Figma font style string.
 * Inter uses "Semi Bold" (with space); most other fonts use "SemiBold".
 */
export function getFontStyle(weight: number, family: string): string {
  const f = family.toLowerCase();
  const useSpace = f.includes('inter');

  if (weight >= 900) return 'Black';
  if (weight >= 800) return 'ExtraBold';
  if (weight >= 700) return 'Bold';
  if (weight >= 600) return useSpace ? 'Semi Bold' : 'SemiBold';
  if (weight >= 500) return 'Medium';
  if (weight >= 300) return 'Light';
  if (weight >= 200) return 'ExtraLight';
  if (weight >= 100) return 'Thin';
  return 'Regular';
}

/** Normalize CSS font-family to a Figma-compatible name */
export function normalizeFontFamily(family: string): string {
  if (!family) return 'Inter';
  const f = family.toLowerCase();

  const fontMap: Record<string, string> = {
    inter: 'Inter',
    roboto: 'Roboto',
    arial: 'Arial',
    helvetica: 'Helvetica',
    'helvetica neue': 'Helvetica Neue',
    georgia: 'Georgia',
    'times new roman': 'Times New Roman',
    verdana: 'Verdana',
    'open sans': 'Open Sans',
    lato: 'Lato',
    montserrat: 'Montserrat',
    poppins: 'Poppins',
    'source sans pro': 'Source Sans Pro',
    nunito: 'Nunito',
    raleway: 'Raleway',
    ubuntu: 'Ubuntu',
    geist: 'Geist',
    'geist mono': 'Geist Mono',
    'system-ui': 'Inter',
    '-apple-system': 'Inter',
    'segoe ui': 'Inter',
    'sf pro': 'SF Pro',
    'sf pro display': 'SF Pro Display',
    'sf pro text': 'SF Pro Text',
    'courier new': 'Courier New',
    'lucida console': 'Lucida Console',
    monospace: 'Courier New',
    'sans-serif': 'Inter',
    serif: 'Georgia',
  };

  for (const [key, val] of Object.entries(fontMap)) {
    if (f.includes(key)) return val;
  }

  // Title-case the family name as fallback
  return family
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}
