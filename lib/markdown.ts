// Tiny markdown renderer (h1/h2/h3 + ul/ol + code + bold + link) — no deps
export type TocEntry = { lvl: number; text: string; id: string };
export type MdResult = { html: string; toc: TocEntry[] };

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function inline(s: string) {
  let r = escapeHtml(s);
  r = r.replace(/`([^`]+)`/g, '<code>$1</code>');
  r = r.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  r = r.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  r = r.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  return r;
}

export function renderMarkdown(md: string): MdResult {
  const lines = md.split('\n');
  const toc: TocEntry[] = [];
  let html = '';
  let inUl = false, inOl = false, inCode = false, codeLang = '', codeBuf: string[] = [];
  const flush = () => { if (inUl) { html += '</ul>\n'; inUl = false; } if (inOl) { html += '</ol>\n'; inOl = false; } };

  for (const raw of lines) {
    const line = raw;
    if (line.startsWith('```')) {
      if (!inCode) { inCode = true; codeLang = line.slice(3).trim(); codeBuf = []; flush(); }
      else { inCode = false; html += `<pre><code class="lang-${codeLang}">${escapeHtml(codeBuf.join('\n'))}</code></pre>\n`; }
      continue;
    }
    if (inCode) { codeBuf.push(line); continue; }

    const h = line.match(/^(#{1,3})\s+(.+)$/);
    if (h) {
      flush();
      const lvl = h[1].length;
      const text = h[2].trim();
      const id = slugify(text);
      toc.push({ lvl, text, id });
      html += `<h${lvl} id="${id}">${inline(text)}</h${lvl}>\n`;
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      if (inOl) { html += '</ol>\n'; inOl = false; }
      if (!inUl) { html += '<ul>\n'; inUl = true; }
      html += `<li>${inline(line.replace(/^[-*]\s+/, ''))}</li>\n`;
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      if (inUl) { html += '</ul>\n'; inUl = false; }
      if (!inOl) { html += '<ol>\n'; inOl = true; }
      html += `<li>${inline(line.replace(/^\d+\.\s+/, ''))}</li>\n`;
      continue;
    }
    if (line.trim() === '') { flush(); continue; }
    flush();
    html += `<p>${inline(line)}</p>\n`;
  }
  flush();

  return { html, toc };
}
