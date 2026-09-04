/**
 * מייצר את אייקוני האפליקציה כקבצי PNG בלי תלות בספריות חיצוניות.
 * מצייר משקולת בצבע ליים על רקע כהה. הרצה: node scripts/make-assets.js
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

function writePng(file, width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0;
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, png);
  console.log('נוצר', file, `${width}x${height}`);
}

const BG = [11, 13, 15, 255];
const LIME = [198, 244, 50, 255];

/** ציור משקולת ממורכזת בתוך קנבס ריבועי */
function render(size, { transparentBg = false, scale = 1 } = {}) {
  const buf = Buffer.alloc(size * size * 4);
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const unit = (s / 100) * scale;

  const rects = [
    // מוט מרכזי
    { x: -30, y: -4.5, w: 60, h: 9 },
    // משקולות פנימיות
    { x: -38, y: -15, w: 9, h: 30 },
    { x: 29, y: -15, w: 9, h: 30 },
    // משקולות חיצוניות
    { x: -48, y: -9, w: 8, h: 18 },
    { x: 40, y: -9, w: 8, h: 18 },
  ];

  const radius = s * 0.22; // פינות מעוגלות לרקע

  for (let y = 0; y < s; y++) {
    for (let x = 0; x < s; x++) {
      const i = (y * s + x) * 4;
      let color = transparentBg ? [0, 0, 0, 0] : BG;

      if (!transparentBg) {
        // פינות מעוגלות
        const dx = Math.max(radius - x, x - (s - radius), 0);
        const dy = Math.max(radius - y, y - (s - radius), 0);
        if (dx > 0 && dy > 0 && Math.hypot(dx, dy) > radius) color = [0, 0, 0, 0];
      }

      const rx = (x - cx) / unit;
      const ry = (y - cy) / unit;
      for (const r of rects) {
        if (rx >= r.x && rx <= r.x + r.w && ry >= r.y && ry <= r.y + r.h) {
          color = LIME;
          break;
        }
      }

      buf[i] = color[0];
      buf[i + 1] = color[1];
      buf[i + 2] = color[2];
      buf[i + 3] = color[3];
    }
  }
  return buf;
}

const out = path.join(__dirname, '..', 'assets');
writePng(path.join(out, 'icon.png'), 1024, 1024, render(1024));
writePng(path.join(out, 'adaptive-icon.png'), 1024, 1024, render(1024, { transparentBg: true, scale: 0.72 }));
writePng(path.join(out, 'splash.png'), 1024, 1024, render(1024, { scale: 0.75 }));
writePng(path.join(out, 'favicon.png'), 64, 64, render(64));
