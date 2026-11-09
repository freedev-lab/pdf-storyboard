import { useRef, useState } from "react";
import { disposePdf, loadPdf } from "./services/pdfLoader";
import type { LoadedPdf } from "./types/pdf";

export default function App() {
  const [pdf, setPdf] = useState<LoadedPdf | null>(null);
  const [status, setStatus] = useState("No PDF loaded");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;

    setError(null);
    setStatus(`Loading ${file.name}…`);

    try {
      await disposePdf(pdf);
      const loaded = await loadPdf(file);
      setPdf(loaded);
      setStatus(`${loaded.source.name} — ${loaded.pages.length} page(s)`);
    } catch (err) {
      setPdf(null);
      setStatus("Failed to load PDF");
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <main style={{ maxWidth: 720, margin: "48px auto", fontFamily: "system-ui" }}>
      <h1>PDF Storyboard — Step 1 smoke test</h1>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />

      <p>{status}</p>
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {pdf && (
        <ul>
          {pdf.pages.map((page) => (
            <li key={page.pageNumber}>
              Page {page.pageNumber}: {page.width.toFixed(1)} ×{" "}
              {page.height.toFixed(1)} pt
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}