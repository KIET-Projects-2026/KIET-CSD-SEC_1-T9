import React, { useRef, useState } from "react";
import "./PdfUpload.css";

export default function PdfUpload({ onUpload, loading }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState(null);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      alert("Please upload a PDF file.");
      return;
    }
    setFileName(file.name);
    onUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  return (
    <div
      className={`pdf-upload ${dragging ? "pdf-upload--drag" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !loading && inputRef.current?.click()}
      id="pdf-upload-zone"
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {loading ? (
        <div className="pdf-upload__loading">
          <div className="pdf-upload__spinner" />
          <p>Analyzing PDF…</p>
        </div>
      ) : fileName ? (
        <div className="pdf-upload__file">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <p className="pdf-upload__name">{fileName}</p>
          <span className="pdf-upload__hint">Click to change file</span>
        </div>
      ) : (
        <div className="pdf-upload__idle">
          <div className="pdf-upload__icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <p className="pdf-upload__label">Drag & drop a PDF or click to browse</p>
          <span className="pdf-upload__hint">Supports standard PDF files</span>
        </div>
      )}
    </div>
  );
}
