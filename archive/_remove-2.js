const fs = require('fs');
const path = require('path');

const tsFile = 'lib/models-real.ts';
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
const all = eval('(' + tsSrc.slice(arrStart, end + 1) + ')');

const REMOVE_KEYS = ['kwaivgi-kling-v2.0-t2v-master', 'atlascloud-wan-2.6-spicy-image-to-video'];
const removed = all.filter((m) => REMOVE_KEYS.includes(m.atlasKey));
const kept = all.filter((m) => !REMOVE_KEYS.includes(m.atlasKey));
console.log(`Removed ${removed.length} models, kept ${kept.length}`);
removed.forEach((m) => console.log('  -', m.name, '(' + m.atlasKey + ')'));

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
  const ident = (k) => /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k);
  return '{\n' + keys.map((k) => padIn + (ident(k) ? k : JSON.stringify(k)) + ': ' + tsStringify(obj[k], indent + 1)).join(',\n') + '\n' + pad + '}';
}

const content = `// Auto-generated (Vidu + 2 deprecated models removed)
import type { Model } from './models';

export const REAL_MODELS: Model[] = ${tsStringify(kept, 0)};
export const ATLAS_UUID_TO_SLUG: Record<string, string> = {};
`;
fs.writeFileSync(tsFile, content);
console.log('✓ Wrote models-real.ts');

let delCount = 0;
for (const m of removed) {
  const key = m.atlasKey;
  const slug = m.slug;
  const tryDel = (p) => { try { fs.unlinkSync(p); delCount++; } catch {} };
  if (key) {
    tryDel(`public/models-data/schema/${key}.json`);
    tryDel(`public/models-data/example/${key}.json`);
    tryDel(`public/models-data/readme/${key}.md`);
  }
  if (m.demoMedia?.src) tryDel(`public/models-media/covers/${m.demoMedia.src.split('/').pop()}`);
  for (const ext of ['mp4', 'webm', 'jpg', 'jpeg', 'png', 'webp']) {
    tryDel(`public/models-media/samples/${slug}.${ext}`);
  }
}
console.log(`Deleted ${delCount} files`);
