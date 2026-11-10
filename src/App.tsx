import { useEffect } from "react";
import { Upload } from "./components/Upload/Upload";
import { PageThumbnail } from "./components/PageThumbnail/PageThumbnail";
import { StoryboardSettingsPanel } from "./components/StoryboardSettings/StoryboardSettings";
import { StoryboardPreview } from "./components/StoryboardPreview/StoryboardPreview";
import { usePdfDocument } from "./hooks/usePdfDocument";
import { usePageSelection } from "./hooks/usePageSelection";
import { useStoryboardSettings } from "./hooks/useStoryboardSettings";

export default function App() {
  const {
    file,
    pages,
    loading,
    progress,
    error,
    openFile,
    reset,
    updatePages,
    updateCaption,
  } = usePdfDocument();

  const {
    selectedCount,
    allSelected,
    noneSelected,
    toggleSelected,
    selectAll,
    clearSelection,
    movePage,
  } = usePageSelection(pages, updatePages);

  const { settings, updateSettings, resetSettings } = useStoryboardSettings();

  const selectedPages = pages.filter((page) => page.selected);

  // Stop the browser from navigating when a file is dropped outside the zone.
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
        <>
          <section className="workspace" aria-label="PDF pages">
            <div className="workspace__bar">
              <p>
                <strong>{file?.name}</strong> · {pages.length} pages ·{" "}
                {selectedCount} selected
              </p>

              <div className="workspace__actions">
                <button
                  type="button"
                  className="btn btn--small"
                  onClick={selectAll}
                  disabled={loading || allSelected}
                >
                  Select all
                </button>
                <button
                  type="button"
                  className="btn btn--small"
                  onClick={clearSelection}
                  disabled={loading || noneSelected}
                >
                  Clear selection
                </button>
                <button
                  type="button"
                  className="btn btn--small"
                  onClick={reset}
                  disabled={loading}
                >
                  Close PDF
                </button>
              </div>
            </div>

            <ul className="thumb-grid">
              {pages.map((page, index) => (
                <PageThumbnail
                  key={page.pageNumber}
                  page={page}
                  position={index}
                  total={pages.length}
                  onToggleSelected={toggleSelected}
                  onCaptionChange={updateCaption}
                  onMove={movePage}
                />
              ))}
            </ul>
          </section>

          <StoryboardSettingsPanel
            settings={settings}
            selectedCount={selectedCount}
            onChange={updateSettings}
            onReset={resetSettings}
          />

          <StoryboardPreview pages={selectedPages} settings={settings} />
        </>
      )}
    </div>
  );
}
