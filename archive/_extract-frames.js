// Extract first frame of each template video via Playwright → save as poster.jpg
process.env.NODE_PATH = 'C:/Users/Admin/Desktop/node_modules';
require('module').Module._initPaths();
const { chromium } = require('C:/Users/Admin/Desktop/node_modules/playwright');
const fs = require('fs');
const path = require('path');

const TPL_DIR = path.join(__dirname, 'public/studio-templates');
const POSTER_DIR = path.join(__dirname, 'public/studio-templates/posters');
fs.mkdirSync(POSTER_DIR, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 720, height: 1280 } });

  const videos = fs.readdirSync(TPL_DIR).filter((f) => f.endsWith('.mp4'));
  console.log(`Extracting frames from ${videos.length} videos`);

  for (const v of videos) {
    const id = v.replace('.mp4', '');
    const outFile = path.join(POSTER_DIR, id + '.jpg');
    if (fs.existsSync(outFile)) { console.log('  skip', id); continue; }

    const page = await ctx.newPage();
    // Build HTML that loads local video file as data URL via file:// protocol won't work; use base64
    const videoBuffer = fs.readFileSync(path.join(TPL_DIR, v));
    const videoBase64 = videoBuffer.toString('base64');

    // Wait video to load + seek to 1.5s for nice frame, then screenshot
    const html = `<!doctype html><html><body style="margin:0;background:#000;">
      <video id="v" muted playsinline style="width:100%;height:100vh;object-fit:cover" src="data:video/mp4;base64,${videoBase64}"></video>
      <script>
        const v = document.getElementById('v');
        v.addEventListener('loadeddata', () => { v.currentTime = 1.5; });
      </script>
    </body></html>`;

    await page.setContent(html);
    await page.waitForTimeout(2500);
    await page.locator('#v').screenshot({ path: outFile });
    await page.close();
    console.log('  ✓', id);
  }

  await browser.close();
  console.log('Done!');
})().catch((e) => { console.error(e); process.exit(1); });
