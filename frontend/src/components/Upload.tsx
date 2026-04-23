/**
 * Image upload component for CropGuard AI.
 *
 * Handles drag and drop and click to browse
 * leaf image uploads with preview.
 *
 * Features:
 *   - Drag and drop support
 *   - Click to browse files
 *   - Image preview before analysis
 *   - File type and size validation
 *   - Base64 conversion for API
 */

"use client";

import { useState, useRef, useCallback } from "react";

interface UploadProps {
  onImageReady: (
    imageData: string,
    imageType: string,
    preview: string
  ) => void;
}

/**
 * Convert File to base64 string.
 */
function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = () => reject(new Error("Read failed"));
    reader.readAsDataURL(file);
  });
}

export default function Upload({ onImageReady }: UploadProps) {
  const [dragOver,  setDragOver]  = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [loading,   setLoading]   = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setError(null);

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp"
    ];

    if (!validTypes.includes(file.type)) {
      setError(
        "Invalid file type. Please use JPG, PNG or WEBP."
      );
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Image too large. Maximum size is 5MB."
      );
      return;
    }

    setLoading(true);

    try {
      const base64    = await toBase64(file);
      const preview   = URL.createObjectURL(file);
      onImageReady(base64, file.type, preview);
    } catch {
      setError(
        "Failed to read image. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [onImageReady]);

  const handleDrop = useCallback((
    e: React.DragEvent
  ) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div>
      {/* Upload Area */}
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={e => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          background:   "rgba(255, 255, 255, 0.04)",
          backdropFilter: "blur(8px)",
          border:       `2px dashed ${
            dragOver
              ? "#6AAB35"
              : "rgba(106, 171, 53, 0.35)"
          }`,
          borderRadius: "20px",
          padding:      "64px 32px",
          textAlign:    "center",
          cursor:       "pointer",
          transition:   "all 0.25s ease",
          transform:    dragOver ? "scale(1.01)" : "scale(1)",
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />

        {loading ? (
          <div>
            <div style={{
              width:        "48px",
              height:       "48px",
              borderRadius: "50%",
              border:       "3px solid rgba(106, 171, 53, 0.2)",
              borderTop:    "3px solid #6AAB35",
              margin:       "0 auto 16px",
              animation:    "spin 1s linear infinite",
            }} />
            <p style={{
              color:    "#B4DC78",
              fontSize: "15px",
            }}>
              Reading image...
            </p>
          </div>
        ) : (
          <div>
            <div style={{
              fontSize:     "56px",
              marginBottom: "20px",
            }}>
              📸
            </div>
            <h3 style={{
              color:        "#F5F0E8",
              fontSize:     "20px",
              marginBottom: "10px",
              fontFamily:   "Georgia, serif",
            }}>
              Drop your leaf photo here
            </h3>
            <p style={{
              color:        "rgba(180, 220, 120, 0.5)",
              fontSize:     "14px",
              marginBottom: "24px",
            }}>
              or click to browse — JPG, PNG, WEBP supported
            </p>

            {/* Tips */}
            <div style={{
              display:        "flex",
              gap:            "12px",
              justifyContent: "center",
              flexWrap:       "wrap",
            }}>
              {[
                "🍃 Clear photo",
                "☀️ Good lighting",
                "📐 Leaf visible"
              ].map(tip => (
                <span key={tip} style={{
                  background:   "rgba(106, 171, 53, 0.1)",
                  color:        "rgba(180, 220, 120, 0.7)",
                  border:       "1px solid rgba(106, 171, 53, 0.2)",
                  borderRadius: "20px",
                  padding:      "5px 14px",
                  fontSize:     "13px",
                }}>
                  {tip}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          background:   "rgba(192, 57, 43, 0.1)",
          border:       "1.5px solid rgba(192, 57, 43, 0.4)",
          borderRadius: "10px",
          padding:      "12px 16px",
          marginTop:    "12px",
          color:        "#FFAAAA",
          fontSize:     "14px",
        }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}