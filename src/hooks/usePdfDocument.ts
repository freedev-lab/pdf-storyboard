import { useCallback, useEffect, useRef, useState } from "react";
import { disposePdf, loadPdf } from "../services/pdfLoader";
import { renderPageToDataUrl } from "../services/pdfRenderer";
import { captionFromText, extractPageText } from "../services/pdfTextExtractor";
import type { LoadedPdf } from "../types/pdf";
import type { PdfPage } from "../types/storyboard";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

export interface PdfDocumentState {
  file: File | null;
  pages: PdfPage[];
  loading: boolean;
  /** 0..1, based on rendered thumbnails. */
  progress: number;
  error: string | null;
}

function isPdfFile(file: File): boolean {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}

function createPages(loaded: LoadedPdf): PdfPage[] {
  return loaded.pages.map((page) => ({
    pageNumber: page.pageNumber,
    width: page.width,
    height: page.height,
    thumbnail: "",
    caption: "",
    selected: true,
  }));
}

export function usePdfDocument() {
  const [state, setState] = useState<PdfDocumentState>({
    file: null,
    pages: [],
    loading: false,
    progress: 0,
    error: null,
  });

  const loadedRef = useRef<LoadedPdf | null>(null);
  /** Incremented on every new open/reset/unmount to cancel stale work. */
  const runIdRef = useRef(0);

  const reset = useCallback(() => {
    runIdRef.current += 1;
    void disposePdf(loadedRef.current);
    loadedRef.current = null;
    setState({ file: null, pages: [], loading: false, progress: 0, error: null });
  }, []);

  const openFile = useCallback(async (file: File) => {
    if (!isPdfFile(file)) {
      setState((current) => ({
        ...current,
        error: "That file isn't a PDF. Choose a .pdf file.",
      }));
      return;
    }
    if (file.size === 0) {
      setState((current) => ({ ...current, error: "That file is empty." }));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setState((current) => ({
        ...current,
        error: "That PDF is larger than 100 MB.",
      }));
      return;
    }

    // Start a new run and cancel the previous one.
    const runId = runIdRef.current + 1;
    runIdRef.current = runId;

    const previous = loadedRef.current;
    loadedRef.current = null;
    void disposePdf(previous);

    setState({ file, pages: [], loading: true, progress: 0, error: null });

    try {
      const loaded = await loadPdf(file);

      // A newer file was opened (or the hook unmounted) while loading.
      if (runId !== runIdRef.current) {
        void disposePdf(loaded);
        return;
      }
      loadedRef.current = loaded;

      const pages = createPages(loaded);
      setState((current) => ({ ...current, pages }));

      // Render sequentially: predictable memory, steady progress.
      for (const [index, page] of pages.entries()) {
        const thumbnail = await renderPageToDataUrl(
          loaded.document,
          page.pageNumber,
        );

        if (runId !== runIdRef.current) return;

        // Text extraction must never sink the whole document.
        let caption = "";
        try {
          const text = await extractPageText(loaded.document, page.pageNumber);
          caption = captionFromText(text);
        } catch (error) {
          console.warn(
            `Could not extract text from page ${page.pageNumber}`,
            error,
          );
        }

        if (runId !== runIdRef.current) return;

        setState((current) => ({
          ...current,
          pages: current.pages.map((item) =>
            item.pageNumber === page.pageNumber
              ? { ...item, thumbnail, caption: item.caption || caption }
              : item,
          ),
          progress: (index + 1) / pages.length,
        }));
      }

      if (runId === runIdRef.current) {
        setState((current) => ({ ...current, loading: false, progress: 1 }));
      }
    } catch (error) {
      if (runId !== runIdRef.current) return;

      console.error("Failed to load PDF", error);
      void disposePdf(loadedRef.current);
      loadedRef.current = null;

      setState({
        file: null,
        pages: [],
        loading: false,
        progress: 0,
        error: "Could not read this PDF. It may be damaged or password-protected.",
      });
    }
  }, []);

  const toggleSelected = useCallback((pageNumber: number) => {
    setState((current) => ({
      ...current,
      pages: current.pages.map((page) =>
        page.pageNumber === pageNumber
          ? { ...page, selected: !page.selected }
          : page,
      ),
    }));
  }, []);

  const updateCaption = useCallback((pageNumber: number, caption: string) => {
    setState((current) => ({
      ...current,
      pages: current.pages.map((page) =>
        page.pageNumber === pageNumber ? { ...page, caption } : page,
      ),
    }));
  }, []);

  // Free the worker when the app unmounts.
  useEffect(() => {
    return () => {
      runIdRef.current += 1;
      void disposePdf(loadedRef.current);
      loadedRef.current = null;
    };
  }, []);

  return { ...state, openFile, reset, toggleSelected, updateCaption };
}
