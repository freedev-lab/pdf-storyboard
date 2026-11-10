import { useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import "./Upload.css";

interface UploadProps {
  onFileSelected: (file: File) => void;
  loading: boolean;
  progress: number;
  fileName?: string | null;
  error?: string | null;
}

export function Upload({
  onFileSelected,
  loading,
  progress,
  fileName,
  error,
}: UploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const [dragging, setDragging] = useState(false);

  const percent = Math.round(progress * 100);

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow picking the same file again
    if (file) onFileSelected(file);
  }

  function handleDragEnter(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    dragDepth.current += 1;
    setDragging(true);
  }

  function handleDragOver(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }

  function handleDragLeave(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragging(false);
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) onFileSelected(file);
  }

  return (
    <div className={`upload${dragging ? " upload--dragging" : ""}`}>
      <button
        type="button"
        className="upload__dropzone"
        onClick={() => inputRef.current?.click()}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        disabled={loading}
      >
        <svg
          className="upload__icon"
          viewBox="0 0 24 24"
          width="40"
          height="40"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M14 3v5h5" />
          <path d="M19 8.5V19a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7z" />
          <path d="M12 18v-5" />
          <path d="m9.5 15.5 2.5-2.5 2.5 2.5" />
        </svg>

        <span className="upload__title">
          {loading
            ? `Rendering page previews… ${percent}%`
            : "Drop a PDF here or click to browse"}
        </span>

        <span className="upload__hint">
          PDF only · processed in your browser · nothing is uploaded
        </span>
      </button>

      <input
        ref={inputRef}
        className="upload__input"
        type="file"
        accept="application/pdf,.pdf"
        onChange={handleInputChange}
      />

      {loading && (
        <div
          className="upload__progress"
          role="progressbar"
          aria-label="Rendering page previews"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
        >
          <span style={{ width: `${percent}%` }} />
        </div>
      )}

      {fileName && !error && <p className="upload__file">{fileName}</p>}
      {error && (
        <p className="upload__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}