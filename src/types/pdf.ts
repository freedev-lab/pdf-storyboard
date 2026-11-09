import type {
  PDFDocumentLoadingTask,
  PDFDocumentProxy,
} from "pdfjs-dist";


export interface PdfSource {
  name: string;
  size: number;
  bytes: Uint8Array;
}


export interface PdfPageMetrics {
  pageNumber: number;
  width: number;
  height: number;
}


export interface LoadedPdf {
  source: PdfSource;
  /** The loading task owns the worker; call task.destroy() to free it. */
  task: PDFDocumentLoadingTask;
  document: PDFDocumentProxy;
  pages: PdfPageMetrics[];
}