import { useState } from "react";
import UploadForm from "./components/UploadForm";
import ResultCard from "./components/ResultCard";
import Loader from "./components/Loader";
import "./styles/main.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleSubmit(image, caption) {
    setLoading(true);
    setResult(null);
    setError(null);

    const formData = new FormData();
    formData.append("image", image);
    formData.append("caption", caption);

    try {
      const res = await fetch(`${API_URL}/analyse`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `Server error ${res.status}`);
      }

      setResult(await res.json());
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
        <p className="app-subtitle">Upload an image, get a description and sentiment read</p>
      </header>

      <main className="app-main">
        <UploadForm onSubmit={handleSubmit} loading={loading} />

        {loading && <Loader />}

        {error && (
          <div className="error-box">
            <strong>Something went wrong:</strong> {error}
          </div>
        )}

        {result && !loading && <ResultCard result={result} />}
      </main>
    </div>
  );
}
