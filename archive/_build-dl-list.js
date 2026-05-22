const fs = require('fs');
const urls = JSON.parse(fs.readFileSync('C:/Users/Admin/Downloads/atlascloud-scrape/higgsfield-scrape/video-urls.json', 'utf8'));
const lines = urls.map((u, i) => {
  const ext = (u.match(/\.([a-z0-9]+)(\?|$)/) || ['', 'mp4'])[1];
  return `tpl-${String(i + 1).padStart(2, '0')}.${ext}\t${u}`;
});
fs.writeFileSync('C:/Users/Admin/Desktop/ai-studio-hub/_dl-list.tsv', lines.join('\n'));
console.log('Wrote', lines.length, 'download entries');
