import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import type { PdfPage, StoryboardSettings } from "../../types/storyboard";
import {
  FONT_STACKS,
  LAYOUT_LABELS,
  PAPER_LABELS,
  getSheetMetrics,
  paginatePages,
} from "../../utils/layout";
import "./StoryboardPreview.css";

interface StoryboardPreviewProps {
  pages: PdfPage[];
  settings: StoryboardSettings;
}

type SheetStyle = CSSProperties & Record<string, string | number>;

export function StoryboardPreview({ pages, settings }: StoryboardPreviewProps) {
  const rows = Math.max(1, settings.rows);
  const columns = Math.max(1, settings.columns);
  const perSheet = rows * columns;

  const sheets = useMemo(
    () => paginatePages(pages, perSheet),
    [pages, perSheet],
  );

  const [requestedSheet, setRequestedSheet] = useState(0);

  // Keep the pager valid when pages are deselected or the grid changes.
  const lastSheet = Math.max(0, sheets.length - 1);
  const sheetIndex = Math.min(requestedSheet, lastSheet);

  const metrics = getSheetMetrics(settings);
  const sheet = sheets[sheetIndex];

  const sheetStyle: SheetStyle = {
    aspectRatio: `${metrics.width} / ${metrics.height}`,
    "--sheet-gap": `${settings.spacing * metrics.scale}px`,
    "--sheet-pad": `${settings.spacing * metrics.scale * 1.4}px`,
    "--caption-size": `${settings.captionFontSize * metrics.scale}px`,
    "--label-size": `${Math.max(8, settings.captionFontSize - 1) * metrics.scale}px`,
    "--board-accent": settings.accentColor,
    "--board-cols": columns,
    "--board-rows": rows,
    fontFamily: FONT_STACKS[settings.fontFamily] ?? settings.fontFamily,
  };

  return (
    <section className="board" aria-label="Storyboard preview">
      <div className="board__head">
        <div>
          <h2 className="board__title">Storyboard preview</h2>
          <p className="board__meta">
            {LAYOUT_LABELS[settings.layout]} ·{" "}
            {PAPER_LABELS[settings.paperSize]} {settings.orientation} ·{" "}
            {perSheet} {perSheet === 1 ? "panel" : "panels"} per sheet
          </p>
        </div>

        {sheets.length > 0 && (
          <div className="board__pager">
            <button
              type="button"
              className="btn btn--small"
              onClick={() => setRequestedSheet(Math.max(0, sheetIndex - 1))}
              disabled={sheetIndex === 0}
              aria-label="Previous sheet"
            >
              ←
            </button>
            <span className="board__count" aria-live="polite">
              Sheet {sheetIndex + 1} / {sheets.length}
            </span>
            <button
              type="button"
              className="btn btn--small"
              onClick={() =>
                setRequestedSheet(Math.min(lastSheet, sheetIndex + 1))
              }
              disabled={sheetIndex >= sheets.length - 1}
              aria-label="Next sheet"
            >
              →
            </button>
          </div>
        )}
      </div>

      {pages.length === 0 ? (
        <p className="board__empty">
          Select at least one page above to lay out a storyboard sheet.
        </p>
      ) : sheet ? (
        <div className="board__canvas">
          <div className="board-sheet" style={sheetStyle}>
            {sheet.map((page, panelIndex) => {
              const panelNumber = sheetIndex * perSheet + panelIndex + 1;
              const label = settings.labelPrefix.trim() || "Panel";

              return (
                <figure
                  key={page.pageNumber}
                  className={`panel panel--${settings.layout}`}
                  data-page={page.pageNumber}
                >
                  <div
                    className={`panel__frame${
                      settings.showFrames ? " panel__frame--bordered" : ""
                    }`}
                  >
                    {page.thumbnail ? (
                      <img
                        src={page.thumbnail}
                        alt={`Preview of page ${page.pageNumber}`}
                        draggable={false}
                      />
                    ) : (
                      <div
                        className="panel__skeleton"
                        aria-label="Rendering preview"
                      />
                    )}

                    {settings.showLabels && (
                      <span className="panel__tag">
                        {label} {panelNumber}
                      </span>
                    )}
                  </div>

                  <figcaption className="panel__caption">
                    {page.caption ? (
                      <p className="panel__text">{page.caption}</p>
                    ) : (
                      <p className="panel__text panel__text--empty">
                        No caption
                      </p>
                    )}
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}
