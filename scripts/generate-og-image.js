import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

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

  const compressed = zlib.deflateSync(scanlines, { level: 8 });
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

function evalCubic(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
}

function sampleNCurve(badgeCx, badgeCy, badgeSize) {
  const samples = [];
  const totalSteps = 40;
  const s = badgeSize;

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
      x: badgeCx - s / 2 + (x / 100) * s,
      y: badgeCy - s / 2 + (y / 100) * s,
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

function renderOgImage() {
  const W = 1200;
  const H = 630;
  const buf = Buffer.alloc(W * H * 4);

  const badgeCx = 320;
  const badgeCy = 315;
  const badgeSize = 280;
  const halfBadge = badgeSize / 2;
  const badgeRadius = 64;
  const strokeW = badgeSize * 0.14;
  const halfStroke = strokeW / 2;

  const headL = {
    x: badgeCx - halfBadge + badgeSize * 0.31,
    y: badgeCy - halfBadge + badgeSize * 0.22,
    r: badgeSize * 0.085
  };
  const headR = {
    x: badgeCx - halfBadge + badgeSize * 0.69,
    y: badgeCy - halfBadge + badgeSize * 0.19,
    r: badgeSize * 0.09
  };

  const segments = sampleNCurve(badgeCx, badgeCy, badgeSize);

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const idx = (y * W + x) * 4;

      // Base: High contrast obsidian dark background with cyan & violet ambient spotlights
      const dx1 = x - 320;
      const dy1 = y - 315;
      const d1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
      const glow1 = Math.max(0, 1 - d1 / 650);

      const dx2 = x - 850;
      const dy2 = y - 250;
      const d2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
      const glow2 = Math.max(0, 1 - d2 / 700);

      let r = Math.round(9 + glow1 * 20 + glow2 * 25);
      let g = Math.round(9 + glow1 * 30 + glow2 * 15);
      let b = Math.round(18 + glow1 * 75 + glow2 * 60);

      // Check badge box
      const relX = x - badgeCx;
      const relY = y - badgeCy;
      const dBox = sdRoundedBox(relX, relY, halfBadge, halfBadge, badgeRadius);

      if (dBox <= 1) {
        const boxAlpha = Math.max(0, Math.min(1, 0.5 - dBox));
        const t = (relX + relY + badgeSize) / (badgeSize * 2);
        let bR = Math.round(28 * (1 - t) + 12 * t);
        let bG = Math.round(28 * (1 - t) + 12 * t);
        let bB = Math.round(44 * (1 - t) + 16 * t);

        if (dBox >= -2.5 && dBox <= 0.5) {
          bR = Math.min(255, bR + 45);
          bG = Math.min(255, bG + 50);
          bB = Math.min(255, bB + 65);
        }

        // Distance to N-curve
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

        const dHeadL = Math.sqrt((x - headL.x) ** 2 + (y - headL.y) ** 2);
        const headLAlpha = Math.max(0, Math.min(1, headL.r - dHeadL + 0.5));

        const dHeadR = Math.sqrt((x - headR.x) ** 2 + (y - headR.y) ** 2);
        const headRAlpha = Math.max(0, Math.min(1, headR.r - dHeadR + 0.5));

        let markR = 0, markG = 0, markB = 0, markAlpha = 0;

        if (nAlpha > 0) {
          let mr, mg, mb;
          if (curveT <= 0.33) {
            const lt = curveT / 0.33;
            mr = Math.round(6 * (1 - lt) + 59 * lt);
            mg = Math.round(182 * (1 - lt) + 130 * lt);
            mb = Math.round(212 * (1 - lt) + 246 * lt);
          } else if (curveT <= 0.67) {
            const lt = (curveT - 0.33) / 0.34;
            mr = Math.round(59 * (1 - lt) + 139 * lt);
            mg = Math.round(130 * (1 - lt) + 92 * lt);
            mb = Math.round(246 * (1 - lt) + 246 * lt);
          } else {
            const lt = (curveT - 0.67) / 0.33;
            mr = Math.round(139 * (1 - lt) + 217 * lt);
            mg = Math.round(92 * (1 - lt) + 70 * lt);
            mb = Math.round(246 * (1 - lt) + 239 * lt);
          }
          markR = mr;
          markG = mg;
          markB = mb;
          markAlpha = nAlpha;
        }

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

        bR = Math.round(bR * (1 - markAlpha) + markR * markAlpha);
        bG = Math.round(bG * (1 - markAlpha) + markG * markAlpha);
        bB = Math.round(bB * (1 - markAlpha) + markB * markAlpha);

        r = Math.round(r * (1 - boxAlpha) + bR * boxAlpha);
        g = Math.round(g * (1 - boxAlpha) + bG * boxAlpha);
        b = Math.round(b * (1 - boxAlpha) + bB * boxAlpha);
      }

      buf[idx] = Math.min(255, Math.max(0, r));
      buf[idx + 1] = Math.min(255, Math.max(0, g));
      buf[idx + 2] = Math.min(255, Math.max(0, b));
      buf[idx + 3] = 255;
    }
  }

  return encodePNG(W, H, buf);
}

const publicDir = path.resolve('public');
const ogPng = renderOgImage();
fs.writeFileSync(path.join(publicDir, 'og-image.png'), ogPng);
console.log('Successfully generated updated public/og-image.png (' + ogPng.length + ' bytes)');
