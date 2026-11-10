import type {
  Orientation,
  PaperSize,
  StoryboardLayout,
  StoryboardSettings,
} from "../../types/storyboard";
import { FONT_OPTIONS, LAYOUT_LABELS, PAPER_LABELS } from "../../utils/layout";
import "./StoryboardSettings.css";

interface StoryboardSettingsProps {
  settings: StoryboardSettings;
  selectedCount: number;
  onChange: (patch: Partial<StoryboardSettings>) => void;
  onReset: () => void;
}

const LAYOUT_OPTIONS: Array<{
  value: StoryboardLayout;
  hint: string;
}> = [
  { value: "grid", hint: "Image above the caption" },
  { value: "notes", hint: "Ruled caption area" },
  { value: "filmstrip", hint: "Caption beside the image" },
];

const PAPER_OPTIONS: PaperSize[] = ["a4", "letter", "a3", "slide"];

function clampInteger(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function StoryboardSettingsPanel({
  settings,
  selectedCount,
  onChange,
  onReset,
}: StoryboardSettingsProps) {
  const perSheet = Math.max(1, settings.rows * settings.columns);
  const sheetCount = Math.ceil(selectedCount / perSheet);

  return (
    <section className="settings" aria-label="Storyboard settings">
      <div className="settings__head">
        <div>
          <h2 className="settings__title">Storyboard layout</h2>
          <p className="settings__meta">
            {selectedCount} {selectedCount === 1 ? "page" : "pages"} selected ·{" "}
            {perSheet} per sheet ·{" "}
            {sheetCount === 0
              ? "no sheets yet"
              : `${sheetCount} ${sheetCount === 1 ? "sheet" : "sheets"}`}
          </p>
        </div>
        <button type="button" className="btn btn--small" onClick={onReset}>
          Reset layout
        </button>
      </div>

      <div className="settings__grid">
        <fieldset className="field field--wide">
          <legend className="field__label">Layout</legend>
          <div className="segmented">
            {LAYOUT_OPTIONS.map((option) => {
              const active = settings.layout === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  className={`segmented__btn${active ? " is-active" : ""}`}
                  aria-pressed={active}
                  title={option.hint}
                  onClick={() => onChange({ layout: option.value })}
                >
                  {LAYOUT_LABELS[option.value]}
                </button>
              );
            })}
          </div>
        </fieldset>

        <label className="field">
          <span className="field__label">Paper</span>
          <select
            className="field__control"
            name="paperSize"
            value={settings.paperSize}
            onChange={(event) =>
              onChange({ paperSize: event.target.value as PaperSize })
            }
          >
            {PAPER_OPTIONS.map((paper) => (
              <option key={paper} value={paper}>
                {PAPER_LABELS[paper]}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field__label">Orientation</span>
          <select
            className="field__control"
            name="orientation"
            value={settings.orientation}
            onChange={(event) =>
              onChange({ orientation: event.target.value as Orientation })
            }
          >
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
          </select>
        </label>

        <label className="field">
          <span className="field__label">Rows</span>
          <input
            className="field__control"
            type="number"
            name="rows"
            min={1}
            max={5}
            value={settings.rows}
            onChange={(event) => {
              const value = event.currentTarget.valueAsNumber;
              if (Number.isFinite(value)) {
                onChange({ rows: clampInteger(value, 1, 5) });
              }
            }}
          />
        </label>

        <label className="field">
          <span className="field__label">Columns</span>
          <input
            className="field__control"
            type="number"
            name="columns"
            min={1}
            max={5}
            value={settings.columns}
            onChange={(event) => {
              const value = event.currentTarget.valueAsNumber;
              if (Number.isFinite(value)) {
                onChange({ columns: clampInteger(value, 1, 5) });
              }
            }}
          />
        </label>

        <label className="field">
          <span className="field__label">
            Spacing <output className="field__value">{settings.spacing} pt</output>
          </span>
          <input
            className="field__range"
            type="range"
            name="spacing"
            min={4}
            max={48}
            step={2}
            value={settings.spacing}
            onChange={(event) => onChange({ spacing: event.target.valueAsNumber })}
          />
        </label>

        <label className="field">
          <span className="field__label">
            Caption size{" "}
            <output className="field__value">
              {settings.captionFontSize} pt
            </output>
          </span>
          <input
            className="field__range"
            type="range"
            name="captionFontSize"
            min={8}
            max={16}
            step={1}
            value={settings.captionFontSize}
            onChange={(event) =>
              onChange({ captionFontSize: event.target.valueAsNumber })
            }
          />
        </label>

        <label className="field">
          <span className="field__label">Label prefix</span>
          <input
            className="field__control"
            type="text"
            name="labelPrefix"
            maxLength={16}
            value={settings.labelPrefix}
            onChange={(event) => onChange({ labelPrefix: event.target.value })}
          />
        </label>

        <label className="field">
          <span className="field__label">Font</span>
          <select
            className="field__control"
            name="fontFamily"
            value={settings.fontFamily}
            onChange={(event) => onChange({ fontFamily: event.target.value })}
          >
            {FONT_OPTIONS.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        </label>

        <label className="field field--color">
          <span className="field__label">Accent</span>
          <span className="field__colorwrap">
            <input
              className="field__color"
              type="color"
              name="accentColor"
              value={settings.accentColor}
              onChange={(event) => onChange({ accentColor: event.target.value })}
            />
            <code className="field__hex">{settings.accentColor}</code>
          </span>
        </label>
      </div>

      <div className="settings__toggles">
        <label className="switch">
          <input
            type="checkbox"
            name="showLabels"
            checked={settings.showLabels}
            onChange={(event) =>
              onChange({ showLabels: event.target.checked })
            }
          />
          <span>Panel labels</span>
        </label>

        <label className="switch">
          <input
            type="checkbox"
            name="showFrames"
            checked={settings.showFrames}
            onChange={(event) =>
              onChange({ showFrames: event.target.checked })
            }
          />
          <span>Frames</span>
        </label>
      </div>
    </section>
  );
}
