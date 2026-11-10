import type { PDFDocumentProxy } from "pdfjs-dist";

/**
 * Reads the text layer of one page and returns lightly normalized text.
 * Returns "" for scanned pages that have no text layer.
 */
export async function extractPageText(
  pdf: PDFDocumentProxy,
  pageNumber: number,
): Promise<string> {
  const page = await pdf.getPage(pageNumber);

  try {
    const content = await page.getTextContent();
    const lines: string[] = [];
    let current = "";

    for (const item of content.items) {
      if (!("str" in item)) continue; // TextMarkedContent carries no text

      current += item.str;

      if (item.hasEOL) {
        lines.push(current.trim());
        current = "";
      } else {
        current += " ";
      }
    }

    if (current.trim()) lines.push(current.trim());

    return lines
      .join("\n")
      .replace(/[ \t]+/g, " ")
      .trim();
  } finally {
    page.cleanup();
  }
}

/**
 * Turns arbitrary page text into a short, single-line caption:
 * collapses whitespace and cuts at a word boundary.
 */
export function captionFromText(text: string, maxLength = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return "";
  if (clean.length <= maxLength) return clean;

  const clipped = clean.slice(0, maxLength);
  const lastSpace = clipped.lastIndexOf(" ");
  const cutAt = lastSpace > maxLength * 0.6 ? lastSpace : maxLength;

  return `${clipped.slice(0, cutAt).trimEnd()}…`;
}
