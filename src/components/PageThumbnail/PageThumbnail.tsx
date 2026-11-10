import type { PdfPage } from "../../types/storyboard";
import { CaptionEditor } from "../CaptionEditor/CaptionEditor";
import "./PageThumbnail.css";

interface PageThumbnailProps {
  page: PdfPage;
  onToggleSelected: (pageNumber: number) => void;
  onCaptionChange: (pageNumber: number, caption: string) => void;
}

export function PageThumbnail({
  page,
  onToggleSelected,
  onCaptionChange,
}: PageThumbnailProps) {
  return (
    <li className={`thumb${page.selected ? "" : " thumb--off"}`}>
      <label className="thumb__check">
        <input
          type="checkbox"
          checked={page.selected}
          onChange={() => onToggleSelected(page.pageNumber)}
        />
        <span>Page {page.pageNumber}</span>
      </label>

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

      <CaptionEditor
        value={page.caption}
        onChange={(caption) => onCaptionChange(page.pageNumber, caption)}
      />
    </li>
  );
}
