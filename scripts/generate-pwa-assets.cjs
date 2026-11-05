const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const toCrc = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(toCrc);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function makePng(size, isMaskable = false) {
  const width = size;
  const height = size;
  const rawData = Buffer.alloc(height * (1 + width * 4));

  const cx = width / 2;
  const cy = height / 2;
  const maxRadius = isMaskable ? width * 0.48 : width * 0.44;

  // Star positions for 4-star dragon ball (relative to center, in radius fraction)
  const starPositions = [
    { x: 0, y: -0.22 },      // top
    { x: -0.20, y: 0.05 },   // bottom-left
    { x: 0.20, y: 0.05 },    // bottom-right
    { x: 0, y: 0.22 },       // bottom
  ];
  const starRadius = width * 0.07;

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter byte 0
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= maxRadius) {
        // Outer golden rim
        if (dist > maxRadius * 0.90) {
          rawData[offset++] = 245; // Golden edge
          rawData[offset++] = 158;
          rawData[offset++] = 11;
          rawData[offset++] = 255;
          continue;
        }

        // Check if inside any of the 4 crimson stars
        let insideStar = false;
        for (const sp of starPositions) {
          const sx = cx + sp.x * maxRadius * 1.5;
          const sy = cy + sp.y * maxRadius * 1.5;
          const sdist = Math.sqrt((x - sx) * (x - sx) + (y - sy) * (y - sy));
          if (sdist < starRadius) {
            insideStar = true;
            break;
          }
        }

        if (insideStar) {
          // Crimson red star
          rawData[offset++] = 220;
          rawData[offset++] = 38;
          rawData[offset++] = 38;
          rawData[offset++] = 255;
        } else {
          // Dragon ball warm amber gradient
          const normY = (y - (cy - maxRadius)) / (maxRadius * 2);
          const r = Math.min(255, Math.round(251 - normY * 30));
          const g = Math.min(255, Math.round(191 - normY * 60));
          const b = Math.min(255, Math.round(36 - normY * 20));
          rawData[offset++] = r;
          rawData[offset++] = g;
          rawData[offset++] = b;
          rawData[offset++] = 255;
        }
      } else {
        if (isMaskable) {
          // Maskable icon must fill the entire canvas with dark theme background
          rawData[offset++] = 15;  // #0f172a slate-900
          rawData[offset++] = 23;
          rawData[offset++] = 42;
          rawData[offset++] = 255;
        } else {
          // Transparent
          rawData[offset++] = 0;
          rawData[offset++] = 0;
          rawData[offset++] = 0;
          rawData[offset++] = 0;
        }
      }
    }
  }

  const deflated = zlib.deflateSync(rawData);
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    sig,
    createChunk('IHDR', ihdr),
    createChunk('IDAT', deflated),
    createChunk('IEND', Buffer.alloc(0)),
  ]);
}

const pubDir = path.resolve(__dirname, '../public');
if (!fs.existsSync(pubDir)) {
  fs.mkdirSync(pubDir, { recursive: true });
}

// Generate PNGs
fs.writeFileSync(path.join(pubDir, 'pwa-192x192.png'), makePng(192, false));
fs.writeFileSync(path.join(pubDir, 'pwa-512x512.png'), makePng(512, false));
fs.writeFileSync(path.join(pubDir, 'maskable-icon-512x512.png'), makePng(512, true));
fs.writeFileSync(path.join(pubDir, 'apple-touch-icon.png'), makePng(192, true));

// Generate SVG Icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="ballGlow" cx="40%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="35%" stop-color="#f59e0b" />
      <stop offset="80%" stop-color="#ea580c" />
      <stop offset="100%" stop-color="#b45309" />
    </radialGradient>
    <radialGradient id="rim" cx="50%" cy="50%" r="50%">
      <stop offset="88%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#78350f" />
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#ea580c" flood-opacity="0.5" />
    </filter>
  </defs>

  <rect width="512" height="512" rx="112" fill="#090d16" />
  
  <!-- Outer glowing aura -->
  <circle cx="256" cy="256" r="210" fill="none" stroke="#f59e0b" stroke-width="4" opacity="0.4" />
  <circle cx="256" cy="256" r="190" fill="url(#ballGlow)" stroke="#fef08a" stroke-width="6" filter="url(#shadow)" />

  <!-- 4 Crimson Stars (The 4-Star Ball) -->
  <g fill="#dc2626" stroke="#991b1b" stroke-width="1.5">
    <!-- Top Star -->
    <polygon points="256,160 262,178 280,180 266,192 271,210 256,199 241,210 246,192 232,180 250,178" />
    <!-- Left Star -->
    <polygon points="190,240 196,258 214,260 200,272 205,290 190,279 175,290 180,272 166,260 184,258" />
    <!-- Right Star -->
    <polygon points="322,240 328,258 346,260 332,272 337,290 322,279 307,290 312,272 298,260 316,258" />
    <!-- Bottom Star -->
    <polygon points="256,310 262,328 280,330 266,342 271,360 256,349 241,360 246,342 232,330 250,328" />
  </g>

  <!-- Specular Highlight Curve -->
  <path d="M 140 190 A 130 130 0 0 1 270 130" stroke="#ffffff" stroke-width="8" stroke-linecap="round" opacity="0.65" fill="none" />
</svg>`;

fs.writeFileSync(path.join(pubDir, 'icon.svg'), svgContent);
fs.writeFileSync(path.join(pubDir, 'favicon.svg'), svgContent);

console.log('Successfully generated PWA icon assets in /public');
