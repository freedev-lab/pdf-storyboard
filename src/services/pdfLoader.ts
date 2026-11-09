
import { pdfjsLib } from "../lib/pdfjs";
import type { LoadedPdf, PdfPageMetrics } from "../types/pdf";


export async function loadPdf(file: File): Promise<LoadedPdf> {
  const bytes = new Uint8Array(await file.arrayBuffer());

  const task = pdfjsLib.getDocument({ data: bytes });
  const document = await task.promise;
  const pages: PdfPageMetrics[] = [];

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1 });

    pages.push({
      pageNumber,
      width: viewport.width,
      height: viewport.height,
    });

    page.cleanup();
  }

  return {
    source: { name: file.name, size: file.size, bytes },
    task,
    document,
    pages,
  };
}


export async function disposePdf(pdf: LoadedPdf | null): Promise<void> {
  if (!pdf) return;
  try {
    await pdf.task.destroy();
  } catch {
    // already destroyed
  }
}