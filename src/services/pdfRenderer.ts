import type { PDFDocumentProxy } from "pdfjs-dist";
import { THUMBNAIL_TARGET_WIDTH } from "../utils/constants";

export interface RenderPageOptions {
  maxWidth?: number;
  maxScale?: number;
  type?: "image/jpeg" | "image/png";
  quality?: number;
  background?: string;
}


export async function renderPageToDataUrl(
  pdf: PDFDocumentProxy,
  pageNumber: number,
  {
    maxWidth = THUMBNAIL_TARGET_WIDTH,
    maxScale = 2.5,
    type = "image/jpeg",
    quality = 0.82,
    background = "#ffffff",
  }: RenderPageOptions = {},
): Promise<string> {
  const page = await pdf.getPage(pageNumber);

  try {
    const baseViewport = page.getViewport({ scale: 1 });
    const scale = Math.min(maxWidth / baseViewport.width, maxScale);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.floor(viewport.width));
    canvas.height = Math.max(1, Math.floor(viewport.height));

    const renderTask = page.render({ canvas, viewport, background });
    await renderTask.promise;

    return canvas.toDataURL(type, quality);
  } finally {
    page.cleanup();
  }
}