import { useState, useRef } from "react";

export default function UploadForm({ onSubmit, loading }) {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  function handleFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!image) return;
    onSubmit(image, caption);
  }

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      {/* drop zone doubles as a click target */}
      <div
        className={`drop-zone ${dragOver ? "drag-over" : ""} ${preview ? "has-preview" : ""}`}
        onClick={() => fileInputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {preview ? (
          <img src={preview} alt="preview" className="preview-img" />
        ) : (
          <div className="drop-prompt">
            <span className="drop-icon">🖼️</span>
            <p>Drop an image here, or click to choose</p>
            <p className="drop-hint">JPEG, PNG, WebP, GIF</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>

      <input
        className="caption-input"
        type="text"
        placeholder="Optional caption — leave blank to analyse the image description"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        maxLength={500}
      />

      <button
        type="submit"
        className="submit-btn"
        disabled={!image || loading}
      >
        {loading ? "Analysing…" : "Analyse"}
      </button>
    </form>
  );
}
