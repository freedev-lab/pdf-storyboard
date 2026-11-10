import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
  type RGB,
} from "pdf-lib";
import type { PdfPage as StoryboardPage, StoryboardSettings } from "../types/storyboard";
import { getPaperDimensions, paginatePages } from "../utils/layout";

export interface ExportStoryboardOptions {
  pages: StoryboardPage[];
  settings: StoryboardSettings;
}

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CaptionBox {
  x: number;
  top: number;
  width: number;
  height: number;
}

interface PanelBox {
  frame: Box;
  caption: CaptionBox;
}

const PAPER_COLOR = rgb(1, 0.992, 0.969); // #fffdf7
const INK_COLOR = rgb(0.12, 0.1, 0.08);
const TAG_TEXT_COLOR = rgb(1, 0.992, 0.969);
const PLACEHOLDER_COLOR = rgb(0.94, 0.92, 0.88);
const RULE_COLOR = rgb(0.78, 0.72, 0.64);

const FONT_PAIRS: Record<
  string,
  { regular: StandardFonts; bold: StandardFonts }
> = {
  Helvetica: {
    regular: StandardFonts.Helvetica,
    bold: StandardFonts.HelveticaBold,
  },
  Times: {
    regular: StandardFonts.TimesRoman,
    bold: StandardFonts.TimesRomanBold,
  },
  Courier: {
    regular: StandardFonts.Courier,
    bold: StandardFonts.CourierBold,
  },
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function hexToRgb(hex: string): RGB {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return rgb(0.07, 0.09, 0.15);

  const value = Number.parseInt(match[1], 16);
  return rgb(
    ((value >> 16) & 255) / 255,
    ((value >> 8) & 255) / 255,
    (value & 255) / 255,
  );
}

/**
 * Standard PDF fonts use WinAnsi encoding. Replace anything it cannot encode
 * so a stray emoji cannot fail the whole export.
 */
function sanitizeText(text: string, font: PDFFont): string {
  let result = "";

  for (const character of text.replace(/\s+/g, " ").trim()) {
    try {
      font.widthOfTextAtSize(character, 10);
      result += character;
    } catch {
      result += "?";
    }
  }

  return result;
}

function wrapText(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
): string[] {
  const words = text.split(" ").filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;

    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      line = candidate;
      continue;
    }

    if (line) lines.push(line);

    if (font.widthOfTextAtSize(word, size) <= maxWidth) {
      line = word;
      continue;
    }

    // Hard-break a single word that is wider than the caption column.
    let chunk = "";
    for (const character of word) {
      if (font.widthOfTextAtSize(chunk + character, size) <= maxWidth) {
        chunk += character;
      } else {
        if (chunk) lines.push(chunk);
        chunk = character;
      }
    }
    line = chunk;
  }

  if (line) lines.push(line);
  return lines;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not decode page preview"));
    image.src = src;
  });
}

/**
 * Crops a preview to the panel aspect ratio using the same "cover" rule as
 * the on-screen sheet, so the exported frame matches the preview.
 */
async function cropImageCover(dataUrl: string, aspect: number): Promise<string> {
  const image = await loadImage(dataUrl);
  const width = image.naturalWidth;
  const height = image.naturalHeight;

  if (!width || !height) throw new Error("Page preview has no pixels");

  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = width;
  let sourceHeight = height;

  if (width / height > aspect) {
    sourceWidth = height * aspect;
    sourceX = (width - sourceWidth) / 2;
  } else {
    sourceHeight = width / aspect;
    sourceY = (height - sourceHeight) / 2;
  }

  const outWidth = Math.max(1, Math.round(Math.min(sourceWidth, 900)));
  const outHeight = Math.max(1, Math.round(outWidth / aspect));

  const canvas = document.createElement("canvas");
  canvas.width = outWidth;
  canvas.height = outHeight;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D is unavailable");

  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    outWidth,
    outHeight,
  );

  return canvas.toDataURL("image/jpeg", 0.85);
}

function getPanelBox(
  settings: StoryboardSettings,
  x: number,
  cellTop: number,
  cellWidth: number,
  cellHeight: number,
): PanelBox {
  const innerGap = settings.spacing * 0.35;

  if (settings.layout === "filmstrip") {
    const frameWidth = cellWidth * 0.58;
    return {
      frame: {
        x,
        y: cellTop - cellHeight,
        width: frameWidth,
        height: cellHeight,
      },
      caption: {
        x: x + frameWidth + innerGap,
        top: cellTop,
        width: Math.max(1, cellWidth - frameWidth - innerGap),
        height: cellHeight,
      },
    };
  }

  // Notes give the caption more room; grid favours the image.
  const frameRatio = settings.layout === "notes" ? 0.6 : 0.7;
  const frameHeight = cellHeight * frameRatio;

  return {
    frame: {
      x,
      y: cellTop - frameHeight,
      width: cellWidth,
      height: frameHeight,
    },
    caption: {
      x,
      top: cellTop - frameHeight - innerGap,
      width: cellWidth,
      height: Math.max(1, cellHeight - frameHeight - innerGap),
    },
  };
}

function drawCaption(
  page: PDFPage,
  caption: string,
  box: CaptionBox,
  font: PDFFont,
  fontSize: number,
  ruled: boolean,
): void {
  const text = sanitizeText(caption, font);
  const lineHeight = fontSize * 1.38;
  const maxLines = Math.max(1, Math.floor(box.height / lineHeight));

  if (ruled) {
    for (let index = 1; index <= maxLines; index += 1) {
      const y = box.top - index * lineHeight;
      if (y < box.top - box.height) break;

      page.drawLine({
        start: { x: box.x, y },
        end: { x: box.x + box.width, y },
        thickness: 0.4,
        color: RULE_COLOR,
        opacity: 0.6,
      });
    }
  }

  if (!text) return;

  const lines = wrapText(text, font, fontSize, box.width).slice(0, maxLines);

  lines.forEach((line, index) => {
    page.drawText(line, {
      x: box.x,
      y: box.top - fontSize - index * lineHeight,
      size: fontSize,
      font,
      color: INK_COLOR,
    });
  });
}

function drawTag(
  page: PDFPage,
  box: Box,
  label: string,
  font: PDFFont,
  fontSize: number,
  accent: RGB,
): void {
  const tagHeight = fontSize * 1.6;
  const padX = fontSize * 0.5;
  const width = Math.min(
    box.width,
    font.widthOfTextAtSize(label, fontSize) + padX * 2,
  );

  page.drawRectangle({
    x: box.x,
    y: box.y + box.height - tagHeight,
    width,
    height: tagHeight,
    color: accent,
  });

  page.drawText(label, {
    x: box.x + padX,
    y: box.y + box.height - tagHeight + fontSize * 0.42,
    size: fontSize,
    font,
    color: TAG_TEXT_COLOR,
  });
}

export async function exportStoryboardPdf({
  pages,
  settings,
}: ExportStoryboardOptions): Promise<Blob> {
  if (pages.length === 0) {
    throw new Error("Select at least one page before exporting");
  }

  const columns = clamp(Math.round(settings.columns), 1, 5);
  const rows = clamp(Math.round(settings.rows), 1, 5);
  const sheets = paginatePages(pages, columns * rows);

  const pdf = await PDFDocument.create();
  pdf.setTitle("PDF Storyboard");
  pdf.setCreator("PDF Storyboard");

  const fontPair = FONT_PAIRS[settings.fontFamily] ?? FONT_PAIRS.Helvetica;
  const regularFont = await pdf.embedFont(fontPair.regular);
  const boldFont = await pdf.embedFont(fontPair.bold);

  const accent = hexToRgb(settings.accentColor);
  const { width, height } = getPaperDimensions(
    settings.paperSize,
    settings.orientation,
  );
  const margin = settings.spacing * 1.4;
  const gap = settings.spacing;
  const contentWidth = Math.max(1, width - margin * 2);
  const contentHeight = Math.max(1, height - margin * 2);
  const cellWidth = (contentWidth - gap * (columns - 1)) / columns;
  const cellHeight = (contentHeight - gap * (rows - 1)) / rows;
  const tagFontSize = Math.max(7, settings.captionFontSize - 1);
  const prefix = settings.labelPrefix.trim() || "Panel";

  let panelNumber = 0;

  for (const sheet of sheets) {
    const pdfPage = pdf.addPage([width, height]);

    // Warm paper instead of stark white, matching the preview.
    pdfPage.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: PAPER_COLOR,
    });

    for (const [index, storyboardPage] of sheet.entries()) {
      panelNumber += 1;

      const column = index % columns;
      const row = Math.floor(index / columns);
      const x = margin + column * (cellWidth + gap);
      const cellTop = height - margin - row * (cellHeight + gap);
      const box = getPanelBox(settings, x, cellTop, cellWidth, cellHeight);

      try {
        if (!storyboardPage.thumbnail) {
          throw new Error("Page preview is not ready");
        }

        const cropped = await cropImageCover(
          storyboardPage.thumbnail,
          box.frame.width / box.frame.height,
        );
        const image = await pdf.embedJpg(cropped);
        pdfPage.drawImage(image, box.frame);
      } catch (error) {
        console.warn(
          `Could not export preview for page ${storyboardPage.pageNumber}`,
          error,
        );
        pdfPage.drawRectangle({ ...box.frame, color: PLACEHOLDER_COLOR });
      }

      if (settings.showFrames) {
        pdfPage.drawRectangle({
          ...box.frame,
          borderColor: accent,
          borderWidth: 1,
        });
      }

      if (settings.showLabels) {
        drawTag(
          pdfPage,
          box.frame,
          sanitizeText(`${prefix} ${panelNumber}`, boldFont),
          boldFont,
          tagFontSize,
          accent,
        );
      }

      drawCaption(
        pdfPage,
        storyboardPage.caption,
        box.caption,
        regularFont,
        settings.captionFontSize,
        settings.layout === "notes",
      );
    }
  }

  const bytes = await pdf.save();
  const buffer = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;

  return new Blob([buffer], { type: "application/pdf" });
}

export function storyboardFileName(fileName?: string): string {
  const base = (fileName ?? "storyboard")
    .replace(/\.pdf$/i, "")
    .replace(/[^\w\-. ]+/g, "")
    .trim()
    .replace(/\s+/g, "-");

  const name = base || "storyboard";
  return `${name}${/-storyboard$/i.test(name) ? "" : "-storyboard"}.pdf`;
}
