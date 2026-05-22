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
console.log('Total models:', models.length);

const stats = { exampleVideo: 0, exampleImage: 0, sampleVideo: 0, sampleImage: 0, demoOnly: 0, nothing: 0 };
const noPreview = [];
for (const mod of models) {
  let exFile = null;
  try {
    const exJson = JSON.parse(fs.readFileSync(path.join('public/models-data/example', mod.atlasKey + '.json'), 'utf8'));
    exFile = exJson.examples?.[0]?.outputs?.outputs?.[0];
  } catch {}

  if (exFile) {
    if (/\.(mp4|webm|mov|f4v)$/i.test(exFile)) stats.exampleVideo++;
    else stats.exampleImage++;
  } else if (mod.sampleMedia) {
    if (mod.sampleMedia.type === 'video') stats.sampleVideo++;
    else stats.sampleImage++;
  } else if (mod.demoMedia) {
    stats.demoOnly++;
  } else {
    stats.nothing++;
    noPreview.push(mod.slug);
  }
}
console.log('Output preview coverage:');
console.log(stats);
console.log('Total WITH preview:', models.length - stats.nothing, '/', models.length);
if (noPreview.length) console.log('Models WITHOUT any preview:', noPreview);
