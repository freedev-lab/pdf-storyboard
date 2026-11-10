import { useId } from "react";
import "./CaptionEditor.css";

interface CaptionEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const MAX_LENGTH = 280;

export function CaptionEditor({ value, onChange }: CaptionEditorProps) {
  const id = useId();

  return (
    <div className="caption">
      <div className="caption__head">
        <label className="caption__label" htmlFor={id}>
          Caption
        </label>
        <span className="caption__count">
          {value.length}/{MAX_LENGTH}
        </span>
      </div>

      <textarea
        id={id}
        className="caption__input"
        value={value}
        rows={2}
        maxLength={MAX_LENGTH}
        placeholder="Add a description…"
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
