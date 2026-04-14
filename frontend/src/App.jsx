import { useState } from "react";
import UploadForm from "./components/UploadForm";
import ResultCard from "./components/ResultCard";
import HistoryPanel from "./components/HistoryPanel";
import Loader from "./components/Loader";
import "./styles/main.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null); // [{preview, filename, data}]
  const [history, setHistory] = useState([]);   // [{id, time, items}]
  const [error, setError] = useState(null);

  async function handleSubmit(files, caption) {
    setLoading(true);
    setResults(null);
    setError(null);

    try {
      // fire all requests in parallel — backend is stateless so this is fine
      const items = await Promise.all(
        files.map(async file => {
          const form = new FormData();
          form.append("image", file);
          form.append("caption", caption);

          const res = await fetch(`${API_URL}/analyse`, { method: "POST", body: form });
          if (!res.ok) {
            const d = await res.json().catch(() => ({}));
            throw new Error(d.detail || `Server error ${res.status}`);
          }
          return {
            preview: URL.createObjectURL(file),
            filename: file.name,
            data: await res.json(),
          };
        })
      );

      setResults(items);
      setHistory(prev => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          items,
        },
        ...prev,
      ].slice(0, 20)); // keep last 20 sessions

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">SnapSentiment</h1>
        <p className="app-subtitle">Image understanding · sentiment analysis · comparison</p>
      </header>

      <div className="workspace">
        <aside className="panel-form">
          <UploadForm onSubmit={handleSubmit} loading={loading} />
        </aside>

        <section className="panel-results" aria-live="polite">
          {loading && <Loader />}

          {error && (
            <div className="error-box">
              <strong>Error:</strong> {error}
            </div>
          )}

          {results && !loading && (
            <div className={`results-grid ${results.length > 1 ? "multi" : ""}`}>
              {results.map((r, i) => (
                <ResultCard key={i} preview={r.preview} filename={r.filename} data={r.data} />
              ))}
            </div>
          )}

          {!results && !loading && !error && (
            <div className="empty-state">
              <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.2">
                <rect x="6" y="14" width="52" height="38" rx="5" />
                <circle cx="21" cy="28" r="5" />
                <path d="M6 42l14-11 10 9 8-7 20 18" />
              </svg>
              <p>Upload an image to get started</p>
            </div>
          )}
        </section>
      </div>

      <HistoryPanel history={history} onRestore={setResults} />
    </div>
  );
}
