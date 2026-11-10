import { PAPER_SIZES } from "./constants";
import type {
  Orientation,
  PaperSize,
  StoryboardLayout,
  StoryboardSettings,
} from "../types/storyboard";

/** Width the preview sheet is designed at, in CSS pixels. */
export const PREVIEW_SHEET_WIDTH = 760;

export const LAYOUT_LABELS: Record<StoryboardLayout, string> = {
  grid: "Grid",
  notes: "Notes",
  filmstrip: "Filmstrip",
};

export const PAPER_LABELS: Record<PaperSize, string> = {
  a4: "A4",
  letter: "Letter",
  a3: "A3",
  slide: "Slide",
};

export const FONT_OPTIONS = ["Helvetica", "Times", "Courier"] as const;

export const FONT_STACKS: Record<string, string> = {
  Helvetica: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  Times: 'Georgia, "Times New Roman", Times, serif',
  Courier: '"Courier New", Courier, monospace',
};

export interface SheetMetrics {
  /** Sheet width in PDF points. */
  width: number;
  /** Sheet height in PDF points. */
  height: number;
  /** Preview pixels per PDF point. */
  scale: number;
}

/** Paper dimensions in points, swapped for landscape. */
export function getPaperDimensions(
  paperSize: PaperSize,
  orientation: Orientation,
): { width: number; height: number } {
  const base = PAPER_SIZES[paperSize];
  return orientation === "landscape"
    ? { width: base.height, height: base.width }
    : { width: base.width, height: base.height };
}

export function getSheetMetrics(settings: StoryboardSettings): SheetMetrics {
  const { width, height } = getPaperDimensions(
    settings.paperSize,
    settings.orientation,
  );
  return { width, height, scale: PREVIEW_SHEET_WIDTH / width };
}

/**
 * Splits storyboard pages into sheets of `perSheet` panels.
 * The first sheet is the first slice, so array order stays the board order.
 */
export function paginatePages<T>(pages: T[], perSheet: number): T[][] {
  if (perSheet < 1) return [];

  const sheets: T[][] = [];
  for (let index = 0; index < pages.length; index += perSheet) {
    sheets.push(pages.slice(index, index + perSheet));
  }
  return sheets;
}
