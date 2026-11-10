# PDF Storyboard Generator

A browser-based storyboard generator built with **React + TypeScript + Vite**. Upload a PDF, pick and reorder pages, add captions, choose a layout, and export the result as PDF, PNG, or ZIP — entirely in the browser, with no backend and no file uploads to a server.

Based on the [freeCodeCamp PDF Storyboard Generator tutorial](https://www.freecodecamp.org/news/build-pdf-storyboard-generator-javascript/), rebuilt with React and TypeScript.

## Tech stack

| Technology    | Purpose                              |
| ------------- | ------------------------------------ |
| React         | UI and components                    |
| TypeScript    | Types and safer application logic    |
| Vite          | Dev server and build tool            |
| `pdfjs-dist`  | Read PDFs and render page thumbnails |
| `pdf-lib`     | Generate the exported storyboard PDF |
| `tesseract.js`| OCR for scanned pages                |
| `jszip`       | ZIP downloads                        |

## Getting started

Requires Node.js **20.19+** or **22.12+**.

```bash
npm install
npm run dev
```

Other scripts:

```bash
npm run build    # type-check and production build
npm run preview  # serve the production build
npm run lint     # ESLint
```

## Project structure

```
src/
├── components/          # UI components
│   ├── Upload/
│   ├── PdfWorkspace/
│   ├── PageThumbnail/
│   ├── CaptionEditor/
│   ├── StoryboardSettings/
│   ├── StoryboardPreview/
│   └── ExportControls/
├── hooks/               # React hooks
├── lib/                 # PDF.js worker setup
├── services/            # PDF loading, rendering, OCR, export
├── types/               # Shared TypeScript models
├── utils/               # Constants and layout math
├── App.tsx
├── main.tsx
└── index.css
```

All PDF processing lives in `src/services` and `src/lib`, outside React components.

## Status

**Stage 1 — PDF processing (in progress)**

- [x] Project scaffold, dependencies, and types
- [x] PDF.js worker configured for Vite
- [x] PDF loader service (page count and page dimensions)
- [x] Upload with drag & drop
- [x] Page thumbnails
- [ ] Text extraction

**Stage 2 — Storyboard editor** (planned)
**Stage 3 — Preview and exports** (planned)
**Stage 4 — OCR and polish** (planned)
