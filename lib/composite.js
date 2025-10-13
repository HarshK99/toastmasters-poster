// lib/composite.js
import sharp from "sharp";
import fs from "fs";

export async function composePoster({ backgroundBuffer, portraitBuffer, logoPath, texts, palette }) {
  const bg = sharp(backgroundBuffer).resize(1024, 1280).png();
  const portrait = await sharp(portraitBuffer).resize(600, 800).png().toBuffer();

  // create an overlay for portrait and logo
  const composed = await bg
    .composite([
      { input: portrait, top: 200, left: 220 }, // adjust positions to taste
      { input: Buffer.from(fs.readFileSync(logoPath)), top: 30, left: 30 }
    ])
    .png()
    .toBuffer();

  // render text layer (simple approach using SVG overlay)
  const svgText = `
  <svg width="1024" height="1280">
    <style>
      .title { fill: ${palette.text}; font-size: 48px; font-family: 'Helvetica, Arial, sans-serif'; font-weight:700 }
      .meta { fill: ${palette.text}; font-size: 28px; font-family: 'Helvetica, Arial, sans-serif'; }
    </style>
    <text x="40" y="980" class="title">${escapeXml(texts.clubName || "")} — Meeting ${escapeXml(texts.meetingNumber||"")}</text>
    <text x="40" y="1030" class="meta">Date: ${escapeXml(texts.date||"")} Time: ${escapeXml(texts.time||"")}</text>
    <text x="40" y="1080" class="meta">Place: ${escapeXml(texts.place||"")} Zoom: ${escapeXml(texts.zoomLink||"")}</text>
    <text x="40" y="1130" class="meta">Theme: ${escapeXml(texts.theme||"")}</text>
  </svg>`;

  const final = await sharp(composed)
    .composite([{ input: Buffer.from(svgText), top: 0, left: 0 }])
    .png()
    .toBuffer();

  return final;
}

function escapeXml(unsafe) {
  return (unsafe || "").replace(/[&<>'"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&apos;','"':'&quot;' }[c]));
}
