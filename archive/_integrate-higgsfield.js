// Integrate real Higgsfield data into Studio source
const fs = require('fs');
const path = require('path');
const https = require('https');

const HIGGS = 'C:/Users/Admin/Downloads/atlascloud-scrape/higgsfield-v4';
const HUB = __dirname;
const MEDIA = path.join(HUB, 'public/studio-hf');
fs.mkdirSync(path.join(MEDIA, 'videos'), { recursive: true });
fs.mkdirSync(path.join(MEDIA, 'thumbs'), { recursive: true });

function fetch(url, outPath) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        return fetch(res.headers.location, outPath).then(resolve);
      }
      const ws = fs.createWriteStream(outPath);
      res.pipe(ws);
      ws.on('finish', () => resolve(true));
    }).on('error', () => resolve(false));
  });
}

(async () => {
  // ===== HOOKS =====
  const hooks = JSON.parse(fs.readFileSync(path.join(HIGGS, 'api-setup-hooks-size-20.json'))).items;
  console.log(`Downloading ${hooks.length} hook assets...`);
  const hooksOut = [];
  for (const h of hooks) {
    const vId = h.video_url.split('/').pop();
    const tId = h.thumbnail_url.split('/').pop();
    const vOut = `videos/${vId}`;
    const tOut = `thumbs/${tId}`;
    if (!fs.existsSync(path.join(MEDIA, vOut))) await fetch(h.video_url, path.join(MEDIA, vOut));
    if (!fs.existsSync(path.join(MEDIA, tOut))) await fetch(h.thumbnail_url, path.join(MEDIA, tOut));
    hooksOut.push({
      id: h.id,
      type: h.type,
      name: h.name,
      prompt: h.prompt,
      video: '/studio-hf/' + vOut,
      thumb: '/studio-hf/' + tOut,
    });
    console.log('  ✓', h.name);
  }
  fs.writeFileSync(path.join(HUB, 'lib/studio-hooks.json'), JSON.stringify(hooksOut, null, 2));

  // ===== SETTINGS =====
  const settings = JSON.parse(fs.readFileSync(path.join(HIGGS, 'api-setup-settings-size-20.json'))).items;
  console.log(`\nDownloading ${settings.length} setting assets...`);
  const settingsOut = [];
  for (const s of settings) {
    const vUrl = s.video_url || '';
    const tUrl = s.thumbnail_url || '';
    if (vUrl) {
      const vId = vUrl.split('/').pop();
      if (!fs.existsSync(path.join(MEDIA, 'videos', vId))) await fetch(vUrl, path.join(MEDIA, 'videos', vId));
      const tId = tUrl ? tUrl.split('/').pop() : null;
      if (tId && !fs.existsSync(path.join(MEDIA, 'thumbs', tId))) await fetch(tUrl, path.join(MEDIA, 'thumbs', tId));
      settingsOut.push({
        id: s.id,
        type: s.type,
        name: s.name,
        prompt: s.prompt,
        video: '/studio-hf/videos/' + vId,
        thumb: tId ? '/studio-hf/thumbs/' + tId : '',
      });
      console.log('  ✓', s.name);
    }
  }
  fs.writeFileSync(path.join(HUB, 'lib/studio-settings.json'), JSON.stringify(settingsOut, null, 2));

  // ===== PRESETS (24 templates) =====
  const presetsRaw = JSON.parse(fs.readFileSync(path.join(HIGGS, 'api-presets.json')));
  const presets = Array.isArray(presetsRaw) ? presetsRaw : presetsRaw.items || [];
  console.log(`\nDownloading ${presets.length} preset templates...`);
  const presetsOut = [];
  for (const p of presets) {
    const vUrl = p.video_url || p.preview_url || '';
    const tUrl = p.thumbnail_url || p.preview_thumbnail_url || '';
    if (vUrl) {
      const vId = vUrl.split('/').pop();
      const tId = tUrl ? tUrl.split('/').pop() : null;
      if (!fs.existsSync(path.join(MEDIA, 'videos', vId))) await fetch(vUrl, path.join(MEDIA, 'videos', vId));
      if (tId && !fs.existsSync(path.join(MEDIA, 'thumbs', tId))) await fetch(tUrl, path.join(MEDIA, 'thumbs', tId));
      presetsOut.push({
        id: p.id || vId,
        name: p.name || p.title || 'Preset',
        prompt: p.prompt || p.description || '',
        category: p.category || p.tag || 'preset',
        video: '/studio-hf/videos/' + vId,
        thumb: tId ? '/studio-hf/thumbs/' + tId : '',
        cost: p.cost || p.price || 60,
        ...p, // keep all original fields
      });
      console.log('  ✓', p.name || p.title || vId.slice(0, 20));
    }
  }
  fs.writeFileSync(path.join(HUB, 'lib/studio-presets.json'), JSON.stringify(presetsOut, null, 2));

  // ===== AVATARS =====
  const avatars = JSON.parse(fs.readFileSync(path.join(HIGGS, 'api-avatars-size-20.json'))).items;
  console.log(`\nDownloading ${avatars.length} avatars...`);
  const avatarsOut = [];
  for (const a of avatars) {
    const url = a.thumbnail_url || a.image_url || a.preview_url || '';
    if (url) {
      const fid = url.split('/').pop();
      if (!fs.existsSync(path.join(MEDIA, 'thumbs', fid))) await fetch(url, path.join(MEDIA, 'thumbs', fid));
      avatarsOut.push({
        id: a.id,
        name: a.name || 'Avatar',
        thumb: '/studio-hf/thumbs/' + fid,
        ...a,
      });
    }
  }
  fs.writeFileSync(path.join(HUB, 'lib/studio-avatars.json'), JSON.stringify(avatarsOut, null, 2));

  console.log(`\n═══ DONE ═══`);
  console.log(`Hooks: ${hooksOut.length}`);
  console.log(`Settings: ${settingsOut.length}`);
  console.log(`Presets: ${presetsOut.length}`);
  console.log(`Avatars: ${avatarsOut.length}`);
})().catch(console.error);
