import type { PdfPage } from "../../types/storyboard";
import { CaptionEditor } from "../CaptionEditor/CaptionEditor";
import "./PageThumbnail.css";

interface PageThumbnailProps {
  page: PdfPage;
  position: number;
  total: number;
  onToggleSelected: (pageNumber: number) => void;
  onCaptionChange: (pageNumber: number, caption: string) => void;
  onMove: (pageNumber: number, offset: number) => void;
}

export function PageThumbnail({
  page,
  position,
  total,
  onToggleSelected,
  onCaptionChange,
  onMove,
}: PageThumbnailProps) {
  const isFirst = position === 0;
  const isLast = position === total - 1;

  return (
    <li className={`thumb${page.selected ? "" : " thumb--off"}`}>
      <div className="thumb__head">
        <label className="thumb__check">
          <input
            type="checkbox"
            checked={page.selected}
            onChange={() => onToggleSelected(page.pageNumber)}
          />
          <span>Page {page.pageNumber}</span>
        </label>
        <span
          className="thumb__pos"
          title="Position in the storyboard"
        >
          {position + 1}/{total}
        </span>
      </div>

      <div className="thumb__frame">
        {page.thumbnail ? (
          <img
            src={page.thumbnail}
            alt={`Preview of page ${page.pageNumber}`}
            draggable={false}
          />
        ) : (
          <div className="thumb__skeleton" aria-label="Rendering preview" />
        )}
      </div>

      <div className="thumb__move">
        <button
          type="button"
          onClick={() => onMove(page.pageNumber, -1)}
          disabled={isFirst}
          aria-label={`Move page ${page.pageNumber} earlier`}
          title="Move earlier"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => onMove(page.pageNumber, 1)}
          disabled={isLast}
          aria-label={`Move page ${page.pageNumber} later`}
          title="Move later"
        >
          →
        </button>
      </div>

      <CaptionEditor
        value={page.caption}
        onChange={(caption) => onCaptionChange(page.pageNumber, caption)}
      />
    </li>
  );
}
