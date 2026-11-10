import { useState } from "react";
import {
  exportStoryboardPdf,
  storyboardFileName,
} from "../../services/storyboardExporter";
import { downloadBlob } from "../../utils/download";
import type { PdfPage, StoryboardSettings } from "../../types/storyboard";
import "./ExportControls.css";

interface ExportControlsProps {
  pages: PdfPage[];
  settings: StoryboardSettings;
  fileName?: string;
  /** True while previews are still rendering. */
  disabled?: boolean;
}

export function ExportControls({
  pages,
  settings,
  fileName,
  disabled = false,
}: ExportControlsProps) {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const perSheet = Math.max(1, settings.rows) * Math.max(1, settings.columns);
  const sheetCount = Math.ceil(pages.length / perSheet);
  const canExport = !disabled && !exporting && pages.length > 0;

  async function handleExport() {
    if (!canExport) return;

    setExporting(true);
    setError(null);
    setNotice(null);

    try {
      const blob = await exportStoryboardPdf({ pages, settings });
      downloadBlob(blob, storyboardFileName(fileName));
      setNotice(
        `Exported ${pages.length} ${pages.length === 1 ? "panel" : "panels"} on ${sheetCount} ${
          sheetCount === 1 ? "sheet" : "sheets"
        }.`,
      );
    } catch (exportError) {
      console.error("Storyboard export failed", exportError);
      setError("Could not build the PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <section className="export" aria-label="Export storyboard">
      <div className="export__copy">
        <p className="export__eyebrow">Export</p>
        <h2 className="export__title">Download the storyboard</h2>
        <p className="export__meta">
          {disabled
            ? "Waiting for the page previews to finish rendering…"
            : `${pages.length} ${pages.length === 1 ? "panel" : "panels"} · ${sheetCount} ${
                sheetCount === 1 ? "sheet" : "sheets"
              } · PDF`}
        </p>
        <p className="export__hint">
          The PDF is generated locally from the page previews. Nothing is
          uploaded.
        </p>
      </div>

      <div className="export__actions">
        <button
          type="button"
          className="btn export__button"
          onClick={handleExport}
          disabled={!canExport}
        >
          {exporting ? "Building PDF…" : "Download storyboard PDF"}
        </button>

        {notice && (
          <p className="export__notice" role="status">
            {notice}
          </p>
        )}
        {error && (
          <p className="export__error" role="alert">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
