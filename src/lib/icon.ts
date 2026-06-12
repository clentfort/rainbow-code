const ICON_SIZE = 512;
const SAFE_INSET = 0.1;

function fitTextSize(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): number {
  let size = ICON_SIZE * (text.length === 1 ? 0.55 : 0.42);
  for (let i = 0; i < 8; i++) {
    ctx.font = `700 ${size}px system-ui, sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size *= 0.9;
  }
  return size;
}

export function initialsFromName(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export async function makeInitialsIcon(text: string, bg: string): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = ICON_SIZE;
  canvas.height = ICON_SIZE;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, ICON_SIZE, ICON_SIZE);
  ctx.fillStyle = isLight(bg) ? '#111' : '#fff';
  const inset = ICON_SIZE * SAFE_INSET;
  const maxWidth = ICON_SIZE - inset * 2;
  fitTextSize(ctx, text, maxWidth);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, ICON_SIZE / 2, ICON_SIZE / 2 + ICON_SIZE * 0.03);
  return await canvasToBlob(canvas);
}

export async function fileToIcon(file: File, bg: string): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = ICON_SIZE;
  canvas.height = ICON_SIZE;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, ICON_SIZE, ICON_SIZE);
  const inset = ICON_SIZE * SAFE_INSET;
  const target = ICON_SIZE - inset * 2;
  const scale = Math.min(target / bmp.width, target / bmp.height);
  const w = bmp.width * scale;
  const h = bmp.height * scale;
  ctx.drawImage(bmp, (ICON_SIZE - w) / 2, (ICON_SIZE - h) / 2, w, h);
  return await canvasToBlob(canvas);
}

export async function urlToIcon(url: string, bg: string): Promise<Blob> {
  const res = await fetch(url, { mode: 'cors' });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const blob = await res.blob();
  const file = new File([blob], 'icon', { type: blob.type });
  return fileToIcon(file, bg);
}

export function isLight(hex: string): boolean {
  const m = hex.replace('#', '').match(/.{2}/g);
  if (!m) return true;
  const [r, g, b] = m.map((s) => parseInt(s, 16));
  return r * 0.299 + g * 0.587 + b * 0.114 > 160;
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png'),
  );
}
