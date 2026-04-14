import { useState } from "react";

// maps label → short colour token used in CSS
const BADGE_CLASS = {
  positive: "badge-positive",
  negative: "badge-negative",
  neutral: "badge-neutral",
};

export default function HistoryPanel({ history, onRestore }) {
  const [open, setOpen] = useState(false);

  if (history.length === 0) return null;

  return (
    <div className="history-panel">
      <button className="history-toggle" onClick={() => setOpen(o => !o)}>
        <span>Session history</span>
        <span className="history-count">{history.length}</span>
        <svg
          className={`history-chevron ${open ? "open" : ""}`}
          viewBox="0 0 16 16" width="14" height="14" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        >
          <path d="M3 6l5 5 5-5" />
        </svg>
      </button>

      {open && (
        <ul className="history-list">
          {history.map(entry => (
            <li key={entry.id} className="history-entry" onClick={() => onRestore(entry.items)}>
              <div className="history-thumbs">
                {entry.items.slice(0, 3).map((item, i) => (
                  <img key={i} src={item.preview} alt="" className="history-thumb" />
                ))}
                {entry.items.length > 3 && (
                  <span className="history-overflow">+{entry.items.length - 3}</span>
                )}
              </div>
              <div className="history-meta">
                <span className="history-time">{entry.time}</span>
                <div className="history-badges">
                  {entry.items.map((item, i) => (
                    <span key={i} className={`history-badge ${BADGE_CLASS[item.data.sentiment.label]}`}>
                      {item.data.sentiment.label}
                    </span>
                  ))}
                </div>
              </div>
              <span className="history-restore-hint">Restore</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
