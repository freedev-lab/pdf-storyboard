import type { PaperSize, StoryboardSettings } from "../types/storyboard";


export const PAPER_SIZES: Record<PaperSize, { width: number; height: number }> = {
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612, height: 792 },
  a3: { width: 841.89, height: 1190.55 },
  slide: { width: 720, height: 405 },
};

export const DEFAULT_SETTINGS: StoryboardSettings = {
  layout: "grid",
  paperSize: "a4",
  orientation: "portrait",
  rows: 3,
  columns: 2,
  showLabels: true,
  showFrames: true,
  spacing: 16,
  labelPrefix: "Panel",
  accentColor: "#111827",
  fontFamily: "Helvetica",
  captionFontSize: 10,
};


export const THUMBNAIL_TARGET_WIDTH = 480;