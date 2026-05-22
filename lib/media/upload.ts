/**
 * Upload helper — Local file → backend → AtlasCloud uploadMedia → public URL.
 * Dùng chung cho Video + Image direct pages.
 */

export async function uploadLocalFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/v1/upload-media', {
    method: 'POST',
    body: fd,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || `Upload failed (HTTP ${res.status})`);
  }
  if (!data.url) throw new Error('Backend không trả URL');
  return data.url as string;
}

export function pickLocalFile(accept = 'image/*', multiple = false): Promise<File[]> {
  return new Promise((resolve) => {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = accept;
    inp.multiple = multiple;
    inp.onchange = () => {
      const files = inp.files ? Array.from(inp.files) : [];
      resolve(files);
    };
    inp.click();
  });
}
