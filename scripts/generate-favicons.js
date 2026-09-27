import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Table for CRC-32
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcBuf = Buffer.alloc(4);
  const typeAndData = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(typeAndData), 0);

  return Buffer.concat([lenBuf, typeAndData, crcBuf]);
}

function encodePNG(width, height, rgbaBuffer) {
  const header = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdrChunk = createChunk('IHDR', ihdrData);

  const scanlines = Buffer.alloc(height * (width * 4 + 1));
  let srcOffset = 0;
  let dstOffset = 0;

  for (let y = 0; y < height; y++) {
    scanlines[dstOffset++] = 0;
    rgbaBuffer.copy(scanlines, dstOffset, srcOffset, srcOffset + width * 4);
    srcOffset += width * 4;
    dstOffset += width * 4;
  }

  const compressed = zlib.deflateSync(scanlines, { level: 9 });
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

function distToSegmentSquared(px, py, x1, y1, x2, y2) {
  const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  if (l2 === 0) return { d2: (px - x1) ** 2 + (py - y1) ** 2, t: 0 };
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  const projX = x1 + t * (x2 - x1);
  const projY = y1 + t * (y2 - y1);
  return { d2: (px - projX) ** 2 + (py - projY) ** 2, t };
}

function sdRoundedBox(x, y, w, h, r) {
  const qx = Math.abs(x) - w + r;
  const qy = Math.abs(y) - h + r;
  return Math.min(Math.max(qx, qy), 0) + Math.sqrt(Math.max(qx, 0) ** 2 + Math.max(qy, 0) ** 2) - r;
}

// Cubic bezier evaluator
function evalCubic(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
}

// Pre-sample the Connecting 'N' curve segments
function sampleNCurve(size) {
  // Bezier curve points in 100x100 space:
  // Segment 1: M 21 76 C 21 54, 23 43, 31 41
  // Segment 2: C 41 39, 51 55, 60 75
  // Segment 3: C 64 63, 68 49, 72 37
  const samples = [];
  const totalSteps = 40;

  for (let i = 0; i <= totalSteps; i++) {
    const globalT = i / totalSteps;
    let x, y;
    if (globalT <= 0.35) {
      const localT = globalT / 0.35;
      x = evalCubic(21, 21, 23, 31, localT);
      y = evalCubic(76, 54, 43, 41, localT);
    } else if (globalT <= 0.75) {
      const localT = (globalT - 0.35) / 0.40;
      x = evalCubic(31, 41, 51, 60, localT);
      y = evalCubic(41, 39, 55, 75, localT);
    } else {
      const localT = (globalT - 0.75) / 0.25;
      x = evalCubic(60, 64, 68, 72, localT);
      y = evalCubic(75, 63, 49, 37, localT);
    }
    samples.push({
      x: (x / 100) * size,
      y: (y / 100) * size,
      t: globalT
    });
  }

  const segments = [];
  for (let i = 0; i < samples.length - 1; i++) {
    segments.push({
      x1: samples[i].x,
      y1: samples[i].y,
      x2: samples[i + 1].x,
      y2: samples[i + 1].y,
      tMid: (samples[i].t + samples[i + 1].t) / 2
    });
  }
  return segments;
}

// Render the signature NeighborLy Connecting Two-Person N Icon
function renderNeighborLyIcon(size, isMaskable = false) {
  const buf = Buffer.alloc(size * size * 4);
  const half = size / 2;
  const radius = size * 0.25; // 25% squircle corner radius
  const strokeW = size * 0.14;
  const halfStroke = strokeW / 2;

  const headL = { x: size * 0.31, y: size * 0.22, r: size * 0.085 };
  const headR = { x: size * 0.69, y: size * 0.19, r: size * 0.09 };
  const segments = sampleNCurve(size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;

      // Squircle distance
      const relX = x - half;
      const relY = y - half;
      const dBox = sdRoundedBox(relX, relY, half, half, radius);

      if (dBox > 0.5) {
        // Transparent outside container
        buf[idx] = 0;
        buf[idx + 1] = 0;
        buf[idx + 2] = 0;
        buf[idx + 3] = 0;
        continue;
      }

      const boxAlpha = Math.max(0, Math.min(1, 0.5 - dBox));

      // Container background gradient: Deep navy to obsidian (Image 1, Panel 4)
      const gradT = (x + y) / (size * 2);
      let bgR = Math.round(30 * (1 - gradT) + 9 * gradT);
      let bgG = Math.round(30 * (1 - gradT) + 9 * gradT);
      let bgB = Math.round(46 * (1 - gradT) + 11 * gradT);

      // Subtle container border stroke
      if (dBox >= -1.5 && dBox <= 0.5) {
        bgR = Math.min(255, bgR + 40);
        bgG = Math.min(255, bgG + 45);
        bgB = Math.min(255, bgB + 55);
      }

      // Check distance to N-curve
      let minDistSq = Infinity;
      let curveT = 0;
      for (const seg of segments) {
        const { d2, t } = distToSegmentSquared(x, y, seg.x1, seg.y1, seg.x2, seg.y2);
        if (d2 < minDistSq) {
          minDistSq = d2;
          curveT = seg.tMid;
        }
      }
      const distN = Math.sqrt(minDistSq);
      const nAlpha = Math.max(0, Math.min(1, halfStroke - distN + 0.5));

      // Check distance to left head
      const dHeadL = Math.sqrt((x - headL.x) ** 2 + (y - headL.y) ** 2);
      const headLAlpha = Math.max(0, Math.min(1, headL.r - dHeadL + 0.5));

      // Check distance to right head
      const dHeadR = Math.sqrt((x - headR.x) ** 2 + (y - headR.y) ** 2);
      const headRAlpha = Math.max(0, Math.min(1, headR.r - dHeadR + 0.5));

      // Color computation:
      let markR = 0, markG = 0, markB = 0, markAlpha = 0;

      // 1. Curve color (Cyan -> Blue -> Violet -> Magenta)
      if (nAlpha > 0) {
        let r, g, b;
        if (curveT <= 0.33) {
          // Cyan (#06B6D4: 6, 182, 212) -> Blue (#3B82F6: 59, 130, 246)
          const lt = curveT / 0.33;
          r = Math.round(6 * (1 - lt) + 59 * lt);
          g = Math.round(182 * (1 - lt) + 130 * lt);
          b = Math.round(212 * (1 - lt) + 246 * lt);
        } else if (curveT <= 0.67) {
          // Blue (#3B82F6: 59, 130, 246) -> Violet (#8B5CF6: 139, 92, 246)
          const lt = (curveT - 0.33) / 0.34;
          r = Math.round(59 * (1 - lt) + 139 * lt);
          g = Math.round(130 * (1 - lt) + 92 * lt);
          b = Math.round(246 * (1 - lt) + 246 * lt);
        } else {
          // Violet (#8B5CF6: 139, 92, 246) -> Magenta (#D946EF: 217, 70, 239)
          const lt = (curveT - 0.67) / 0.33;
          r = Math.round(139 * (1 - lt) + 217 * lt);
          g = Math.round(92 * (1 - lt) + 70 * lt);
          b = Math.round(246 * (1 - lt) + 239 * lt);
        }
        markR = r;
        markG = g;
        markB = b;
        markAlpha = nAlpha;
      }

      // 2. Left head color (Cyan to Blue)
      if (headLAlpha > 0) {
        const ht = (x - (headL.x - headL.r)) / (headL.r * 2);
        const hr = Math.round(34 * (1 - ht) + 59 * ht);
        const hg = Math.round(211 * (1 - ht) + 130 * ht);
        const hb = Math.round(238 * (1 - ht) + 246 * ht);

        if (headLAlpha > markAlpha) {
          markR = hr;
          markG = hg;
          markB = hb;
          markAlpha = headLAlpha;
        }
      }

      // 3. Right head color (Violet to Magenta)
      if (headRAlpha > 0) {
        const ht = (x - (headR.x - headR.r)) / (headR.r * 2);
        const hr = Math.round(168 * (1 - ht) + 236 * ht);
        const hg = Math.round(85 * (1 - ht) + 72 * ht);
        const hb = Math.round(247 * (1 - ht) + 153 * ht);

        if (headRAlpha > markAlpha) {
          markR = hr;
          markG = hg;
          markB = hb;
          markAlpha = headRAlpha;
        }
      }

      // Blend mark over background
      const finalR = Math.round(bgR * (1 - markAlpha) + markR * markAlpha);
      const finalG = Math.round(bgG * (1 - markAlpha) + markG * markAlpha);
      const finalB = Math.round(bgB * (1 - markAlpha) + markB * markAlpha);

      buf[idx] = Math.min(255, Math.max(0, finalR));
      buf[idx + 1] = Math.min(255, Math.max(0, finalG));
      buf[idx + 2] = Math.min(255, Math.max(0, finalB));
      buf[idx + 3] = Math.round(boxAlpha * 255);
    }
  }

  return encodePNG(size, size, buf);
}

// Generate all standard icon assets
const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('Generating updated NeighborLy icon suite matching uploaded brand sheet...');

const png16 = renderNeighborLyIcon(16);
fs.writeFileSync(path.join(publicDir, 'favicon-16x16.png'), png16);
console.log('✓ favicon-16x16.png');

const png32 = renderNeighborLyIcon(32);
fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), png32);
console.log('✓ favicon-32x32.png');

const png180 = renderNeighborLyIcon(180);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), png180);
console.log('✓ apple-touch-icon.png');

const png192 = renderNeighborLyIcon(192);
fs.writeFileSync(path.join(publicDir, 'android-chrome-192x192.png'), png192);
console.log('✓ android-chrome-192x192.png');

const png512 = renderNeighborLyIcon(512);
fs.writeFileSync(path.join(publicDir, 'android-chrome-512x512.png'), png512);
console.log('✓ android-chrome-512x512.png');

// Create valid multi-resolution favicon.ico containing 16x16 and 32x32 PNG entries
function createIco(pngBuffers) {
  const count = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  let offset = 6 + count * 16;
  const dirEntries = [];

  for (const png of pngBuffers) {
    const dir = Buffer.alloc(16);
    const size = png === pngBuffers[0] ? 16 : 32;
    dir[0] = size;
    dir[1] = size;
    dir[2] = 0;
    dir[3] = 0;
    dir.writeUInt16LE(1, 4);
    dir.writeUInt16LE(32, 6);
    dir.writeUInt32LE(png.length, 8);
    dir.writeUInt32LE(offset, 12);
    dirEntries.push(dir);
    offset += png.length;
  }

  return Buffer.concat([header, ...dirEntries, ...pngBuffers]);
}

const icoData = createIco([png16, png32]);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoData);
console.log('✓ favicon.ico');

console.log('All brand icons and favicons successfully updated!');
