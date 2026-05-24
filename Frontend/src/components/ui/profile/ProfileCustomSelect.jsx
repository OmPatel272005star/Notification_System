import { useState, useRef, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";

export function ProfileCustomSelect({ value, onChange, options, placeholder, id }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="ep-select-wrap" id={id}>
      <button
        type="button"
        className="ep-select-btn"
        onClick={() => setOpen((o) => !o)}
      >
        <span className={value ? "ep-select-val" : "ep-select-placeholder"}>
          {value || placeholder}
        </span>
        <div className="ep-select-actions">
          {value && (
            <span
              className="ep-select-clear"
              onMouseDown={(e) => { e.stopPropagation(); onChange(""); }}
            >
              <X size={12} />
            </span>
          )}
          <ChevronDown size={14} className={`ep-select-chevron ${open ? "open" : ""}`} />
        </div>
      </button>

      {open && (
        <div className="ep-select-dropdown">
          {options.map((opt) => (
            <div
              key={opt}
              className={`ep-select-option ${opt === value ? "selected" : ""}`}
              onMouseDown={() => { onChange(opt); setOpen(false); }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
