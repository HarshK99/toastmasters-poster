// lib/composite.ts
import fs from "fs";
import path from "path";
import sharp from "sharp";

export type Texts = {
  clubName?: string;
  meetingNumber?: string;
  date?: string;
  time?: string;
  place?: string;
  zoomLink?: string;
  theme?: string;
};

export type Palette = {
  primary?: string;
  primary_2?: string;
  accent?: string;
  bg?: string;
  text?: string;
};

export type ComposeOptions = {
  backgroundBuffer: Buffer | string;
  portraitBuffer: Buffer | string;
  logoPath?: string | null;
  texts?: Texts;
  palette?: Palette;
};

export async function composePoster(opts: ComposeOptions): Promise<Buffer> {
  const { backgroundBuffer, portraitBuffer, logoPath, texts = {}, palette = {} } = opts;

  const normalizeInput = (v: Buffer | string | undefined): Buffer | null => {
    if (!v) return null;
    if (Buffer.isBuffer(v)) return v;
    if (typeof v === "string" && fs.existsSync(v)) return fs.readFileSync(v);
    return null;
  };

  const bgBuf = normalizeInput(backgroundBuffer);
  const portraitBuf = normalizeInput(portraitBuffer);
  const logoBuf = logoPath && fs.existsSync(logoPath) ? fs.readFileSync(logoPath) : null;

  if (!bgBuf) throw new Error("composePoster: missing or invalid backgroundBuffer");
  // Only require portraitBuf if it is provided and not empty
  const hasPortrait = portraitBuf && portraitBuf.length > 0;

  const bgMeta = await sharp(bgBuf).metadata();
  const BG_W = bgMeta.width ?? 1024;
  const BG_H = bgMeta.height ?? 1280;

  let portraitResizedBuf: Buffer | null = null;
  if (hasPortrait) {
    const maxPortraitW = Math.round(BG_W * 0.6);
    const maxPortraitH = Math.round(BG_H * 0.72);
    const portraitSharp = sharp(portraitBuf!).rotate();
    const portraitMeta = await portraitSharp.metadata();
    const targetPortraitWidth = Math.min(portraitMeta.width ?? maxPortraitW, maxPortraitW);
    const targetPortraitHeight = Math.min(portraitMeta.height ?? maxPortraitH, maxPortraitH);
    portraitResizedBuf = await portraitSharp
      .resize({
        width: targetPortraitWidth,
        height: targetPortraitHeight,
        fit: "inside",
        withoutEnlargement: true,
      })
      .png()
      .toBuffer();
  }

  let logoResizedBuf: Buffer | null = null;
  if (logoBuf) {
    try {
      const logoMeta = await sharp(logoBuf).metadata();
      const targetLogoW = Math.round(BG_W * 0.14);
      const logoWidth = Math.min(logoMeta.width ?? targetLogoW, targetLogoW);

      logoResizedBuf = await sharp(logoBuf)
        .resize({ width: logoWidth, withoutEnlargement: true })
        .png()
        .toBuffer();
    } catch {
      logoResizedBuf = null;
    }
  }

  const portraitLeft = Math.round(BG_W * 0.08);
  const portraitTop = Math.round(BG_H * 0.12);

  const composites: Array<{ input: Buffer; left: number; top: number }> = [];
  if (portraitResizedBuf) {
    const portraitLeft = Math.round(BG_W * 0.08);
    const portraitTop = Math.round(BG_H * 0.12);
    composites.push({ input: portraitResizedBuf, left: portraitLeft, top: portraitTop });
  }
  // Only composite the user-provided logo, no extra logos
  if (logoResizedBuf) {
    composites.push({ input: logoResizedBuf, left: 32, top: 32 });
  }

  const composedBuffer = await sharp(bgBuf)
    .resize(BG_W, BG_H, { fit: "cover" })
    .composite(composites as any)
    .png()
    .toBuffer();

  // safer escapeXml: mapping lookup might be undefined, default to empty string
  const escapeXml = (unsafe = ""): string => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&apos;",
      '"': "&quot;",
    };
    return ("" + unsafe).replace(/[&<>'"]/g, (c) => map[c] ?? "");
  };

  const t = (k: keyof Texts) => escapeXml(texts[k] ?? "");

  const textColor = palette.text ?? "#111827";
  const accent = palette.accent ?? "#E94B35";
  const primary = palette.primary ?? "#0B3D91";

  const clubFont = Math.round(BG_W * 0.042);
  const metaFont = Math.round(BG_W * 0.022);
  const themeFont = Math.round(BG_W * 0.03);
  const smallFont = Math.round(BG_W * 0.018);

  const svgText = `
    <svg width="${BG_W}" height="${BG_H}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .club { font-family: 'Helvetica, Arial, sans-serif'; font-size:${clubFont}px; font-weight:700; fill: ${primary}; }
        .meta { font-family: 'Helvetica, Arial, sans-serif'; font-size:${metaFont}px; fill: ${textColor}; }
        .theme { font-family: 'Helvetica, Arial, sans-serif'; font-size:${themeFont}px; font-weight:600; fill: ${accent}; }
        .small { font-family: 'Helvetica, Arial, sans-serif'; font-size:${smallFont}px; fill: ${textColor}; }
      </style>

      <text x="${Math.round(BG_W * 0.04)}" y="${BG_H - Math.round(BG_H * 0.28)}" class="club">${t("clubName")}</text>
      <text x="${Math.round(BG_W * 0.04)}" y="${BG_H - Math.round(BG_H * 0.23)}" class="meta">Meeting ${t("meetingNumber")}</text>
      <text x="${Math.round(BG_W * 0.04)}" y="${BG_H - Math.round(BG_H * 0.19)}" class="theme">${t("theme")}</text>
      <text x="${Math.round(BG_W * 0.04)}" y="${BG_H - Math.round(BG_H * 0.14)}" class="meta">Date: ${t("date")} | Time: ${t("time")}</text>
      <text x="${Math.round(BG_W * 0.04)}" y="${BG_H - Math.round(BG_H * 0.10)}" class="meta">Place: ${t("place")}</text>
      <text x="${Math.round(BG_W * 0.04)}" y="${BG_H - Math.round(BG_H * 0.06)}" class="small">Zoom: ${t("zoomLink")}</text>
    </svg>`.trim();

  const finalBuffer = await sharp(composedBuffer)
    .composite([{ input: Buffer.from(svgText), top: 0, left: 0 }])
    .png()
    .toBuffer();

  return finalBuffer;
}

export default composePoster;
