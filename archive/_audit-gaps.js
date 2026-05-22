const fs = require('fs');
const path = require('path');

const tsSrc = fs.readFileSync('lib/models-real.ts', 'utf8');
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
const models = eval('(' + tsSrc.slice(arrStart, end + 1) + ')');

// GROUP 1: 10 models without example output URLs
console.log('═══════════════════════════════════════════════════════════════');
console.log('  NHÓM 1: 10 MODEL Atlas server-side LỖI — không có example output');
console.log('═══════════════════════════════════════════════════════════════');
console.log('  Lý do: Atlas CDN trả về XML AccessDenied khi fetch example.json');
console.log('  → ai-studio-hub đã ghi placeholder {examples: []} để không crash UI');
console.log('───────────────────────────────────────────────────────────────');

const noOutput = [];
for (const mod of models) {
  const exF = path.join('public/models-data/example', mod.atlasKey + '.json');
  try {
    const j = JSON.parse(fs.readFileSync(exF, 'utf8'));
    if (!j.examples?.[0]?.outputs?.outputs?.length) {
      noOutput.push({ name: mod.name, vendor: mod.vendor, slug: mod.slug, key: mod.atlasKey });
    }
  } catch { noOutput.push({ name: mod.name, vendor: mod.vendor, slug: mod.slug, key: mod.atlasKey }); }
}
noOutput.forEach((m, i) => {
  console.log(`  ${(i + 1).toString().padStart(2)}. ${m.name.padEnd(46)} (${m.vendor})`);
  console.log(`      atlasKey: ${m.key}`);
});

// GROUP 2: Models without sample preview mp4
console.log('\n═══════════════════════════════════════════════════════════════');
console.log('  NHÓM 2: 13 MODEL không có sample preview (hover card video)');
console.log('═══════════════════════════════════════════════════════════════');
console.log('  Lý do: example.json không có URL output mp4 (cùng nhóm 1 + 3 image-only)');
console.log('───────────────────────────────────────────────────────────────');

const noSample = models.filter(m => !m.sampleMedia);
noSample.forEach((m, i) => {
  const isInGroup1 = noOutput.some(g => g.slug === m.slug);
  console.log(`  ${(i + 1).toString().padStart(2)}. ${m.name.padEnd(46)} (${m.vendor})  ${isInGroup1 ? '← nhóm 1' : '← image-only model'}`);
});

console.log('\n═══════════════════════════════════════════════════════════════');
console.log(`  TỔNG: ${noOutput.length} model thiếu output, ${noSample.length} model thiếu sample`);
console.log(`  Còn ${models.length - noSample.length}/${models.length} = ${((models.length - noSample.length)/models.length*100).toFixed(1)}% model có sample đầy đủ`);
console.log('═══════════════════════════════════════════════════════════════');
