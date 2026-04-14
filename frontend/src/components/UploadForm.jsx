import { useState, useRef } from "react";

const MAX = 4;

export default function UploadForm({ onSubmit, loading }) {
  const [images, setImages] = useState([]); // [{file, preview}]
  const [caption, setCaption] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  function addFiles(fileList) {
    const incoming = Array.from(fileList)
      .filter(f => f.type.startsWith("image/"))
      .slice(0, MAX - images.length);

    setImages(prev =>
      [...prev, ...incoming.map(f => ({ file: f, preview: URL.createObjectURL(f) }))].slice(0, MAX)
    );
  }

  function remove(idx) {
    setImages(prev => prev.filter((_, i) => i !== idx));
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!images.length) return;
    onSubmit(images.map(i => i.file), caption);
  }

  const multi = images.length > 1;

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      {images.length > 0 ? (
        <div className={`image-grid cols-${Math.min(images.length, 2)}`}>
          {images.map((img, i) => (
            <div key={i} className="image-slot">
              <img src={img.preview} alt="" className="slot-preview" />
              <button
                type="button"
                className="slot-remove"
                onClick={() => remove(i)}
                aria-label="Remove image"
              >×</button>
            </div>
          ))}
          {images.length < MAX && (
            <button
              type="button"
              className="add-more-btn"
              onClick={() => inputRef.current.click()}
            >
              <span>+</span>
              <span>Add</span>
            </button>
          )}
        </div>
      ) : (
        <div
          className={`drop-zone ${dragOver ? "drag-over" : ""}`}
          onClick={() => inputRef.current.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <div className="drop-prompt">
            <svg className="drop-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="4" y="10" width="40" height="30" rx="4" />
              <circle cx="16" cy="20" r="3" />
              <path d="M4 32l10-8 8 7 6-5 16 13" />
            </svg>
            <p>Drop images here or click to choose</p>
            <p className="drop-hint">Up to {MAX} images · JPEG, PNG, WebP, GIF</p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={e => addFiles(e.target.files)}
      />

      {/* caption only makes sense for single-image analysis */}
      {!multi && (
        <input
          className="caption-input"
          type="text"
          placeholder="Optional caption — leave blank to use BLIP's description"
          value={caption}
          onChange={e => setCaption(e.target.value)}
          maxLength={500}
        />
      )}

      <button
        type="submit"
        className="submit-btn"
        disabled={!images.length || loading}
      >
        {loading
          ? "Analysing…"
          : multi
            ? `Compare ${images.length} images`
            : "Analyse"
        }
      </button>
    </form>
  );
}
