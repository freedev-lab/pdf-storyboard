export type StoryboardLayout = "grid" | "notes" | "filmstrip";

export type PaperSize = "a4" | "letter" | "a3" | "slide";

export type Orientation = "portrait" | "landscape";

export interface PdfPage {
  pageNumber: number;
  width: number;
  height: number;
  thumbnail: string; 
  caption: string;
  selected: boolean;
}

export interface StoryboardSettings {
  layout: StoryboardLayout;
  paperSize: PaperSize;
  orientation: Orientation;
  rows: number;
  columns: number;
  showLabels: boolean;
  showFrames: boolean;
  spacing: number;
  labelPrefix: string;
  accentColor: string;
  fontFamily: string;
  captionFontSize: number;
}

export interface StoryboardState {
  file: File | null;
  pages: PdfPage[];
  settings: StoryboardSettings;
  currentSheet: number;
  loading: boolean;
  error: string | null;
}