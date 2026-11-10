import { useEffect } from "react";
import { Upload } from "./components/Upload/Upload";
import { PageThumbnail } from "./components/PageThumbnail/PageThumbnail";
import { usePdfDocument } from "./hooks/usePdfDocument";

export default function App() {
  const {
    file,
    pages,
    loading,
    progress,
    error,
    openFile,
    reset,
    toggleSelected,
    updateCaption,
  } = usePdfDocument();

  useEffect(() => {
    function block(event: DragEvent) {
      event.preventDefault();
    }
    window.addEventListener("dragover", block);
    window.addEventListener("drop", block);
    return () => {
      window.removeEventListener("dragover", block);
      window.removeEventListener("drop", block);
    };
  }, []);

  const selectedCount = pages.filter((page) => page.selected).length;

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__deco" aria-hidden="true">
          <span className="app__blob app__blob--a" />
          <span className="app__blob app__blob--b" />
          <span className="app__blob app__blob--c" />
        </div>
        <p className="app__eyebrow">Local PDF tool</p>
        <h1 className="app__title">PDF Storyboard</h1>
        <p className="app__subtitle">
          Turn a PDF into a printable storyboard. Files are read locally in your
          browser and never uploaded.
        </p>
      </header>

      <Upload
        onFileSelected={openFile}
        loading={loading}
        progress={progress}
        fileName={file?.name}
        error={error}
      />

      {pages.length > 0 && (
        <section className="workspace" aria-label="PDF pages">
          <div className="workspace__bar">
            <p>
              <strong>{file?.name}</strong> · {pages.length} pages ·{" "}
              {selectedCount} selected
            </p>
            <button
              type="button"
              className="btn"
              onClick={reset}
              disabled={loading}
            >
              Close PDF
            </button>
          </div>

          <ul className="thumb-grid">
            {pages.map((page) => (
              <PageThumbnail
                key={page.pageNumber}
                page={page}
                onToggleSelected={toggleSelected}
                onCaptionChange={updateCaption}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}