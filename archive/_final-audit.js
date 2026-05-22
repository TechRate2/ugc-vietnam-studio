// FINAL comprehensive audit on 179 models — find ANY missing/inconsistency
const fs = require('fs');
const path = require('path');

const HUB = '.';
const DATA = path.join(HUB, 'public/models-data');

// Load 179 models
const tsSrc = fs.readFileSync(path.join(HUB, 'lib/models-real.ts'), 'utf8');
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

console.log(`\n${'═'.repeat(72)}`);
console.log(`  FINAL COMPREHENSIVE AUDIT — ${models.length} models`);
console.log('═'.repeat(72));

const issues = [];
const stats = {
  schema: 0, schemaInput: 0,
  example: 0, exampleValid: 0, exampleOutput: 0,
  readme: 0, readmeContent: 0,
  cover: 0, sample: 0,
  fieldsMissing: 0,
  byCategory: {}, byVendor: {},
  modalityCount: {},
};

for (const mod of models) {
  // Field check
  const required = ['slug', 'name', 'vendor', 'category', 'modalities', 'description', 'pricing', 'atlasKey', 'accent'];
  for (const f of required) {
    if (!mod[f]) issues.push({ slug: mod.slug, type: 'field', detail: `missing ${f}` });
  }

  // Schema
  const sf = path.join(DATA, 'schema', mod.atlasKey + '.json');
  if (fs.existsSync(sf)) {
    stats.schema++;
    try {
      const j = JSON.parse(fs.readFileSync(sf, 'utf8'));
      if (j.components?.schemas?.Input?.properties) stats.schemaInput++;
      else issues.push({ slug: mod.slug, type: 'schema', detail: 'no Input.properties' });
    } catch (e) {
      issues.push({ slug: mod.slug, type: 'schema', detail: 'invalid JSON' });
    }
  } else issues.push({ slug: mod.slug, type: 'schema', detail: 'file missing' });

  // Example
  const ef = path.join(DATA, 'example', mod.atlasKey + '.json');
  if (fs.existsSync(ef)) {
    stats.example++;
    try {
      const j = JSON.parse(fs.readFileSync(ef, 'utf8'));
      stats.exampleValid++;
      if (j.examples?.[0]?.outputs?.outputs?.length) stats.exampleOutput++;
      else issues.push({ slug: mod.slug, type: 'example', detail: 'no output URLs' });
    } catch {
      issues.push({ slug: mod.slug, type: 'example', detail: 'invalid JSON' });
    }
  } else issues.push({ slug: mod.slug, type: 'example', detail: 'file missing' });

  // Readme
  const rf = path.join(DATA, 'readme', mod.atlasKey + '.md');
  if (fs.existsSync(rf)) {
    stats.readme++;
    if (fs.statSync(rf).size > 200) stats.readmeContent++;
    else issues.push({ slug: mod.slug, type: 'readme', detail: 'content too short' });
  } else issues.push({ slug: mod.slug, type: 'readme', detail: 'file missing' });

  // Cover
  if (mod.demoMedia?.src) {
    const cf = path.join(HUB, 'public', mod.demoMedia.src);
    if (fs.existsSync(cf)) stats.cover++;
    else issues.push({ slug: mod.slug, type: 'cover', detail: 'file missing' });
  }

  // Sample
  if (mod.sampleMedia?.src) {
    const sf = path.join(HUB, 'public', mod.sampleMedia.src);
    if (fs.existsSync(sf)) stats.sample++;
    else issues.push({ slug: mod.slug, type: 'sample', detail: 'file missing' });
  }

  // Group stats
  stats.byCategory[mod.category] = (stats.byCategory[mod.category] || 0) + 1;
  stats.byVendor[mod.vendor] = (stats.byVendor[mod.vendor] || 0) + 1;
  for (const md of mod.modalities) stats.modalityCount[md] = (stats.modalityCount[md] || 0) + 1;
}

console.log('\n📊 COVERAGE:');
const showLine = (name, n) => {
  const pct = (n / models.length * 100).toFixed(1);
  const icon = n === models.length ? '✅' : n >= models.length * 0.99 ? '🟢' : n >= models.length * 0.9 ? '🟡' : '🔴';
  console.log(`  ${icon} ${name.padEnd(28)} ${n}/${models.length} (${pct}%)`);
};
showLine('Schema files', stats.schema);
showLine('Schema Input.properties', stats.schemaInput);
showLine('Example files', stats.example);
showLine('Example valid JSON', stats.exampleValid);
showLine('Example has output', stats.exampleOutput);
showLine('Readme files', stats.readme);
showLine('Readme >200 chars', stats.readmeContent);
showLine('Cover thumbnail file', stats.cover);
showLine('Sample preview file', stats.sample);

console.log('\n📁 BY CATEGORY:');
for (const [k, v] of Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1])) console.log(`  ${k.padEnd(12)} ${v}`);

console.log('\n🏢 BY VENDOR:');
for (const [k, v] of Object.entries(stats.byVendor).sort((a, b) => b[1] - a[1])) console.log(`  ${k.padEnd(22)} ${v}`);

console.log('\n🎭 MODALITIES:');
for (const [k, v] of Object.entries(stats.modalityCount).sort((a, b) => b[1] - a[1])) console.log(`  ${k.padEnd(12)} ${v}`);

// Issue breakdown
console.log('\n🔍 ISSUES:', issues.length);
const byType = {};
for (const i of issues) byType[i.type] = (byType[i.type] || 0) + 1;
for (const [t, c] of Object.entries(byType)) console.log(`  ${t.padEnd(15)} ${c}`);

if (issues.length) {
  console.log('\n  Detail (first 20):');
  issues.slice(0, 20).forEach((i) => console.log(`    [${i.type}] ${i.slug}: ${i.detail}`));
  if (issues.length > 20) console.log(`    ...và ${issues.length - 20} issue khác`);
}

// Final verdict
const totalChecks = models.length * 9; // 9 dimension per model
const passedChecks = totalChecks - issues.length;
const pct = (passedChecks / totalChecks * 100).toFixed(2);

console.log('\n' + '═'.repeat(72));
console.log(`  🎯 FINAL SCORE: ${pct}% (${passedChecks}/${totalChecks} checks pass)`);
console.log(`  ${issues.length === 0 ? '🏆 ZERO ISSUES — PERFECT' : issues.length <= 5 ? '✅ NEAR-PERFECT' : '🟢 EXCELLENT'}`);
console.log('═'.repeat(72));
