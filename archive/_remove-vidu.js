// Remove all Vidu models from ai-studio-hub
const fs = require('fs');
const path = require('path');

const HUB = '.';
const tsFile = path.join(HUB, 'lib/models-real.ts');

// Parse current models
const tsSrc = fs.readFileSync(tsFile, 'utf8');
const m = tsSrc.indexOf('export const REAL_MODELS');
const eq = tsSrc.indexOf('=', m);
const arrStart = tsSrc.indexOf('[', eq);
let d = 0, end = -1, inStr = false, esc = false;
for (let i = arrStart; i < tsSrc.length; i++) {
  const c = tsSrc[i];
  if (esc) { esc = false; continue; }
  if (c === '\\') { esc = true; continue; }
  if (c === '"') { inStr = !inStr; continue; }
  if (inStr) continue;
  if (c === '[') d++;
  else if (c === ']') { d--; if (d === 0) { end = i; break; } }
}
const allModels = eval('(' + tsSrc.slice(arrStart, end + 1) + ')');

// Filter out Vidu
const before = allModels.length;
const viduModels = allModels.filter((m) => m.vendor === 'Vidu' || m.vendorSlug === 'vidu');
const remaining = allModels.filter((m) => m.vendor !== 'Vidu' && m.vendorSlug !== 'vidu');
console.log(`Total: ${before} → ${remaining.length} (removed ${viduModels.length} Vidu models)`);

// Re-serialize TS file
function tsStringify(obj, indent = 0) {
  const pad = '  '.repeat(indent);
  const padIn = '  '.repeat(indent + 1);
  if (obj === undefined) return 'undefined';
  if (obj === null) return 'null';
  if (typeof obj === 'string') return JSON.stringify(obj);
  if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    if (obj.every((x) => typeof x === 'string')) return JSON.stringify(obj);
    return '[\n' + obj.map((x) => padIn + tsStringify(x, indent + 1)).join(',\n') + '\n' + pad + ']';
  }
  const keys = Object.keys(obj).filter((k) => obj[k] !== undefined);
  if (!keys.length) return '{}';
  const validIdent = (k) => /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k);
  return '{\n' + keys.map((k) => padIn + (validIdent(k) ? k : JSON.stringify(k)) + ': ' + tsStringify(obj[k], indent + 1)).join(',\n') + '\n' + pad + '}';
}

const tsContent = `// Auto-generated from Atlas Cloud metadata (Vidu vendor removed)
// Source: C:/Users/Admin/Downloads/atlascloud-scrape/metadata/models.json
// Regenerate: node export-to-aistudio.js && node _remove-vidu.js

import type { Model } from './models';

export const REAL_MODELS: Model[] = ${tsStringify(remaining, 0)};

// Mapping atlas-uuid → slug
export const ATLAS_UUID_TO_SLUG: Record<string, string> = {};
`;

fs.writeFileSync(tsFile, tsContent);
console.log('✓ Rewrote models-real.ts');

// Delete Vidu data files
let deletedSchema = 0, deletedExample = 0, deletedReadme = 0, deletedCover = 0, deletedSample = 0;
for (const m of viduModels) {
  const key = m.atlasKey;
  const slug = m.slug;
  const tryDel = (p) => { try { fs.unlinkSync(p); return true; } catch { return false; } };

  if (key) {
    if (tryDel(path.join(HUB, 'public/models-data/schema', key + '.json'))) deletedSchema++;
    if (tryDel(path.join(HUB, 'public/models-data/example', key + '.json'))) deletedExample++;
    if (tryDel(path.join(HUB, 'public/models-data/readme', key + '.md'))) deletedReadme++;
  }

  // Delete covers
  if (m.demoMedia?.src) {
    const coverFile = m.demoMedia.src.split('/').pop();
    if (coverFile && tryDel(path.join(HUB, 'public/models-media/covers', coverFile))) deletedCover++;
  }

  // Delete samples (try multiple extensions)
  for (const ext of ['mp4', 'webm', 'jpg', 'jpeg', 'png', 'webp']) {
    if (tryDel(path.join(HUB, 'public/models-media/samples', slug + '.' + ext))) { deletedSample++; break; }
  }
}

console.log('\nDeleted Vidu data files:');
console.log(`  schema: ${deletedSchema}`);
console.log(`  example: ${deletedExample}`);
console.log(`  readme: ${deletedReadme}`);
console.log(`  cover: ${deletedCover}`);
console.log(`  sample: ${deletedSample}`);
