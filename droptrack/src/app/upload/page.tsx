"use client";
import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { upload } from "@vercel/blob/client";

const ACCEPT = ".mp3,.wav,.flac,.aiff,.ogg,.m4a,.aac";

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function WaveformAnalyzing() {
  return (
    <div className="flex items-end gap-1 h-16">
      {Array.from({ length: 24 }).map((_, i) => (
        <div
          key={i}
          className="flex-1 rounded-full waveform-bar"
          style={{
            background: `linear-gradient(to top, #7c3aed, #06b6d4)`,
            minHeight: "4px",
            animationDelay: `${i * 0.05}s`,
            animationDuration: `${0.8 + Math.random() * 0.6}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function UploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeStep, setAnalyzeStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const STEPS = [
    "Reading audio file...",
    "Extracting embedded tags...",
    "Detecting BPM & musical key...",
    "Analyzing mood & energy...",
    "Classifying genre...",
    "Generating ISRC & UPC codes...",
    "Writing Spotify pitch copy...",
    "Finalizing metadata...",
  ];

  const handleFile = useCallback((f: File) => {
    const ok = ["audio/mpeg", "audio/wav", "audio/flac", "audio/aiff", "audio/ogg", "audio/mp4", "audio/aac", "audio/x-flac", "audio/x-wav"];
    if (!ok.some((mime) => f.type.startsWith(mime)) && !f.name.match(/\.(mp3|wav|flac|aiff|ogg|m4a|aac)$/i)) {
      setError("Please upload an audio file (MP3, WAV, FLAC, AIFF, etc.)");
      return;
    }
    if (f.size > 500 * 1024 * 1024) {
      setError("File must be under 500 MB.");
      return;
    }
    setError(null);
    setFile(f);
  }, []);

  const handleCoverFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) return;
    setCoverFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setCoverPreview((e.target?.result as string) ?? null);
    reader.readAsDataURL(f);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const analyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    setAnalyzeStep(0);

    // Advance step counter visually
    const stepInterval = setInterval(() => {
      setAnalyzeStep((s) => {
        if (s >= STEPS.length - 1) { clearInterval(stepInterval); return STEPS.length - 1; }
        return s + 1;
      });
    }, 600);

    try {
      // Upload directly to Vercel Blob (bypasses Vercel's 4.5 MB function limit)
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/blob-upload",
      });

      // Send the blob URL to the analyze API
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blobUrl: blob.url,
          filename: file.name,
          fileType: file.type,
          fileSize: file.size,
          hasCover: !!coverFile,
        }),
      });

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(`Server error (${res.status}): ${text.slice(0, 120)}`);
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");

      clearInterval(stepInterval);
      // Store in sessionStorage so review page can read it
      sessionStorage.setItem("droptrack_analysis", JSON.stringify(data));
      sessionStorage.setItem("droptrack_filename", file.name);
      if (coverPreview) sessionStorage.setItem("droptrack_cover", coverPreview);

      router.push("/review");
    } catch (err) {
      clearInterval(stepInterval);
      setAnalyzing(false);
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)", color: "var(--text)" }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b"
           style={{ borderColor: "var(--border)" }}>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded flex items-center justify-center"
               style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }}>
            <span className="text-white text-xs font-bold">D</span>
          </div>
          <span className="font-bold">DropTrack</span>
        </Link>
        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--muted)" }}>
          <span className="px-3 py-1 rounded-full font-semibold" style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa" }}>Upload</span>
          <span>→</span>
          <span>Review</span>
          <span>→</span>
          <span>Distribute</span>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-2xl">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-black tracking-tight mb-3">
              Drop your track.{" "}
              <span className="gradient-text">AI does the rest.</span>
            </h1>
            <p className="text-lg" style={{ color: "var(--muted)" }}>
              MP3, WAV, FLAC, AIFF — up to 500 MB
            </p>
          </div>

          {!file && !analyzing && (
            <>
              {/* Drop zone */}
              <div
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                className={`relative rounded-3xl border-2 border-dashed cursor-pointer transition-all p-16 text-center group ${
                  isDragging ? "border-violet-400 scale-[1.02]" : "hover:border-violet-500/50"
                }`}
                style={{
                  borderColor: isDragging ? "#7c3aed" : "var(--border)",
                  background: isDragging ? "rgba(124,58,237,0.05)" : "var(--surface)",
                }}>
                <input
                  ref={inputRef}
                  type="file"
                  accept={ACCEPT}
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                />
                <div className="flex flex-col items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 float"
                       style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(6,182,212,0.2))" }}>
                    <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xl font-semibold mb-1">
                      {isDragging ? "Drop it!" : "Drag & drop your track"}
                    </p>
                    <p className="text-sm" style={{ color: "var(--muted)" }}>
                      or <span style={{ color: "#a78bfa" }}>click to browse</span>
                    </p>
                  </div>
                  <div className="flex gap-2 text-xs flex-wrap justify-center" style={{ color: "var(--muted)" }}>
                    {["MP3", "WAV", "FLAC", "AIFF", "OGG", "M4A"].map((f) => (
                      <span key={f} className="px-2 py-1 rounded" style={{ background: "var(--surface2)" }}>{f}</span>
                    ))}
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-4 px-4 py-3 rounded-xl text-sm"
                     style={{ background: "rgba(239,68,68,0.1)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)" }}>
                  {error}
                </div>
              )}
            </>
          )}

          {/* File selected */}
          {file && !analyzing && (
            <div className="space-y-4">
              {/* Track card */}
              <div className="rounded-2xl p-6 flex items-center gap-5"
                   style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                     style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }}>
                  <svg width="24" height="24" fill="none" stroke="white" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{file.name}</p>
                  <p className="text-sm" style={{ color: "var(--muted)" }}>{formatBytes(file.size)} · {file.type || "audio"}</p>
                </div>
                <button onClick={() => setFile(null)}
                        className="text-sm px-3 py-1 rounded-lg transition-colors hover:text-white"
                        style={{ color: "var(--muted)", background: "var(--surface2)" }}>
                  Remove
                </button>
              </div>

              {/* Cover art upload */}
              <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <p className="font-semibold mb-3">Cover Art <span className="text-xs font-normal ml-1" style={{ color: "var(--muted)" }}>(optional — AI analyzes it too)</span></p>
                <div className="flex items-center gap-4">
                  {coverPreview ? (
                    <img src={coverPreview} alt="Cover" className="w-20 h-20 rounded-xl object-cover" />
                  ) : (
                    <div className="w-20 h-20 rounded-xl flex items-center justify-center text-3xl"
                         style={{ background: "var(--surface2)", border: "1px dashed var(--border)" }}>🖼️</div>
                  )}
                  <label className="cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                         style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}>
                    {coverPreview ? "Change cover" : "Upload cover"}
                    <input type="file" accept="image/*" className="hidden"
                           onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCoverFile(f); }} />
                  </label>
                  {coverPreview && (
                    <button onClick={() => { setCoverPreview(null); setCoverFile(null); }}
                            className="text-sm" style={{ color: "var(--muted)" }}>Remove</button>
                  )}
                </div>
              </div>

              {error && (
                <div className="px-4 py-3 rounded-xl text-sm"
                     style={{ background: "rgba(239,68,68,0.1)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)" }}>
                  {error}
                </div>
              )}

              <button
                onClick={analyze}
                className="w-full py-4 rounded-2xl font-bold text-lg text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #7c3aed, #5b21b6)" }}>
                Analyze with AI →
              </button>

              <p className="text-center text-xs" style={{ color: "var(--muted)" }}>
                AI will read your file, detect BPM, key, genre, mood, and auto-generate all distribution metadata
              </p>
            </div>
          )}

          {/* Analyzing state */}
          {analyzing && (
            <div className="rounded-3xl p-10 text-center"
                 style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="mb-8">
                <WaveformAnalyzing />
              </div>
              <h2 className="text-2xl font-bold mb-2">AI is analyzing your track</h2>
              <p className="text-lg mb-8 transition-all" style={{ color: "#a78bfa" }}>
                {STEPS[analyzeStep]}
              </p>
              {/* Progress */}
              <div className="w-full rounded-full h-2 mb-4" style={{ background: "var(--surface2)" }}>
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${((analyzeStep + 1) / STEPS.length) * 100}%`,
                    background: "linear-gradient(to right, #7c3aed, #06b6d4)",
                  }}
                />
              </div>
              <div className="space-y-2">
                {STEPS.map((step, i) => (
                  <div key={step} className="flex items-center gap-3 text-sm text-left"
                       style={{ color: i <= analyzeStep ? "var(--text)" : "var(--muted)", opacity: i <= analyzeStep ? 1 : 0.4 }}>
                    <span>{i < analyzeStep ? "✅" : i === analyzeStep ? "⏳" : "○"}</span>
                    {step}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
