#!/usr/bin/env node
/**
 * Post-export script: replaces Expo's auto-injected <link rel="icon" href="/favicon.ico">
 * with SVG + PNG links that browsers can actually find and render.
 *
 * Why this exists:
 *   expo export -p web injects its own favicon link AFTER +html.tsx is processed,
 *   so anything in +html.tsx is overridden. This script runs after the export and
 *   patches dist/index.html directly.
 */

const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

const htmlPath = join(__dirname, '..', 'dist', 'index.html');

let html;
try {
  html = readFileSync(htmlPath, 'utf8');
} catch {
  console.error('fix-favicon: dist/index.html not found — run expo export -p web first');
  process.exit(1);
}

// Remove Expo's injected favicon link (any variant it might emit)
const before = html;
html = html.replace(/<link[^>]*rel=["']icon["'][^>]*\/?>/gi, '');

// Inject SVG (modern browsers) + PNG fallback (Safari, older browsers) right before </head>.
// The ?v= query string busts browser favicon caches — increment it when the icon changes.
const V = '2';
const favicons = [
  `<link rel="icon" type="image/svg+xml" href="/favicon.svg?v=${V}" />`,
  `<link rel="icon" type="image/png" href="/favicon.png?v=${V}" />`,
].join('');

html = html.replace('</head>', `${favicons}</head>`);

if (html === before) {
  console.warn('fix-favicon: no changes made — </head> or existing <link rel="icon"> not found');
} else {
  writeFileSync(htmlPath, html, 'utf8');
  console.log('fix-favicon: dist/index.html patched ✓');
  console.log('  removed: <link rel="icon" href="/favicon.ico" />');
  console.log('  added:   <link rel="icon" type="image/svg+xml" href="/favicon.svg" />');
  console.log('  added:   <link rel="icon" type="image/png" href="/favicon.png" />');
}
