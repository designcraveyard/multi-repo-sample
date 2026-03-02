import { build, context } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const isWatch = process.argv.includes('--watch');

// Figma's plugin sandbox uses an older JS engine — target ES2017
// to avoid optional catch binding, optional chaining in output, etc.
const codeConfig = {
  entryPoints: ['src/code.ts'],
  bundle: true,
  outfile: 'dist/code.js',
  target: 'es2017',
  format: 'iife',
};

const uiConfig = {
  entryPoints: ['src/ui.ts'],
  bundle: true,
  outfile: 'dist/ui.js',
  target: 'es2022',
  format: 'iife',
};

async function buildAll() {
  mkdirSync('dist', { recursive: true });

  await build(codeConfig);
  await build(uiConfig);

  const html = readFileSync('src/ui.html', 'utf8');
  const js = readFileSync('dist/ui.js', 'utf8');
  const css = readFileSync('src/ui.css', 'utf8');

  const finalHtml = html
    .replace('<!-- INLINE_CSS -->', `<style>${css}</style>`)
    .replace('<!-- INLINE_JS -->', `<script>${js}</script>`);

  writeFileSync('dist/ui.html', finalHtml);
  console.log('Build complete');
}

if (isWatch) {
  const codeCtx = await context(codeConfig);
  const uiCtx = await context(uiConfig);
  await codeCtx.watch();
  await uiCtx.watch();
  // Rebuild UI HTML on each change
  setInterval(async () => {
    try {
      const html = readFileSync('src/ui.html', 'utf8');
      const js = readFileSync('dist/ui.js', 'utf8');
      const css = readFileSync('src/ui.css', 'utf8');
      const finalHtml = html
        .replace('<!-- INLINE_CSS -->', `<style>${css}</style>`)
        .replace('<!-- INLINE_JS -->', `<script>${js}</script>`);
      writeFileSync('dist/ui.html', finalHtml);
    } catch {}
  }, 1000);
  console.log('Watching for changes...');
} else {
  await buildAll();
}
