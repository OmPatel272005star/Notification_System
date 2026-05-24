import { useState, useRef, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";
import { PHONE_CODES } from "./profileConstants";

export function ProfilePhoneCodeSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const selected = PHONE_CODES.find((p) => p.code === value) || PHONE_CODES[2];

  return (
    <div ref={ref} className="ep-phonecode-wrap">
      <button
        type="button"
        className="ep-phonecode-btn"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="ep-phonecode-val">{selected.code}</span>
        <div className="ep-select-actions">
          <X
            size={11}
            className="ep-select-clear"
            onMouseDown={(e) => { e.stopPropagation(); onChange("+91"); }}
          />
          <ChevronDown size={13} className={`ep-select-chevron ${open ? "open" : ""}`} />
        </div>
      </button>

      {open && (
        <div className="ep-select-dropdown ep-phonecode-dropdown">
          {PHONE_CODES.map((p) => (
            <div
              key={p.code}
              className={`ep-select-option ${p.code === value ? "selected" : ""}`}
              onMouseDown={() => { onChange(p.code); setOpen(false); }}
            >
              {p.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
