"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { TrackMetadata } from "@/lib/types";
import type { AnalyzeResponse } from "@/lib/types";

function ConfidenceBadge({ score, generated }: { score: number; generated: boolean }) {
  const pct = Math.round(score * 100);
  const color = pct >= 90 ? "#34d399" : pct >= 70 ? "#fbbf24" : "#f87171";
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
          style={{ background: `${color}22`, color }}>
      {generated ? "AI " : ""}{pct}%
    </span>
  );
}

function Field({
  label, value, aiKey, confidence, generated, onChange, type = "text", multiline = false,
}: {
  label: string;
  value: string | number | boolean | string[];
  aiKey: string;
  confidence: number;
  generated: boolean;
  onChange: (key: string, val: string) => void;
  type?: string;
  multiline?: boolean;
}) {
  const display = Array.isArray(value) ? value.join(", ") : String(value ?? "");
  return (
    <div className="rounded-xl p-4" style={{ background: "var(--surface2)" }}>
      <div className="flex justify-between items-center mb-2">
        <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>{label}</label>
        <ConfidenceBadge score={confidence} generated={generated} />
      </div>
      {multiline ? (
        <textarea
          value={display}
          onChange={(e) => onChange(aiKey, e.target.value)}
          rows={3}
          className="w-full bg-transparent text-sm resize-none outline-none leading-relaxed"
          style={{ color: "var(--text)" }}
        />
      ) : (
        <input
          type={type}
          value={display}
          onChange={(e) => onChange(aiKey, e.target.value)}
          className="w-full bg-transparent text-sm outline-none font-medium"
          style={{ color: "var(--text)" }}
        />
      )}
    </div>
  );
}

export default function ReviewPage() {
  const router = useRouter();
  const [data, setData] = useState<AnalyzeResponse | null>(null);
  const [metadata, setMetadata] = useState<Partial<TrackMetadata> | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [filename, setFilename] = useState("");
  const [tab, setTab] = useState<"core" | "advanced" | "pitch" | "ids">("core");

  useEffect(() => {
    const raw = sessionStorage.getItem("droptrack_analysis");
    const fn = sessionStorage.getItem("droptrack_filename");
    const cover = sessionStorage.getItem("droptrack_cover");
    if (!raw) { router.push("/upload"); return; }
    const parsed: AnalyzeResponse = JSON.parse(raw);
    setData(parsed);
    setMetadata(parsed.metadata);
    setFilename(fn || "");
    if (cover) setCoverPreview(cover);
  }, [router]);

  const update = (key: string, val: string) => {
    setMetadata((m) => m ? { ...m, [key]: val } : m);
  };

  const proceed = () => {
    sessionStorage.setItem("droptrack_metadata", JSON.stringify(metadata));
    router.push("/distribute");
  };

  if (!data || !metadata) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-violet-500 border-t-transparent animate-spin mx-auto mb-4" />
          <p style={{ color: "var(--muted)" }}>Loading analysis...</p>
        </div>
      </div>
    );
  }

  const conf = metadata.aiConfidence || {};
  const gen = metadata.aiGenerated || {};
  const mood = Array.isArray(metadata.mood) ? metadata.mood.join(", ") : (metadata.mood || "");

  const fmtDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)", color: "var(--text)" }}>
      {/* Nav */}
      <nav className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b glass"
           style={{ borderColor: "var(--border)" }}>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded flex items-center justify-center"
               style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }}>
            <span className="text-white text-xs font-bold">D</span>
          </div>
          <span className="font-bold">DropTrack</span>
        </Link>
        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--muted)" }}>
          <span className="opacity-40">Upload</span>
          <span>→</span>
          <span className="px-3 py-1 rounded-full font-semibold" style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa" }}>Review</span>
          <span>→</span>
          <span>Distribute</span>
        </div>
        <button onClick={proceed}
                className="px-5 py-2 rounded-xl font-bold text-sm text-white transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #7c3aed, #5b21b6)" }}>
          Continue →
        </button>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-black tracking-tight">Review Metadata</h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: "rgba(16,185,129,0.15)", color: "#34d399" }}>
              AI filled {Object.values(gen).filter(Boolean).length} fields
            </span>
          </div>
          <p style={{ color: "var(--muted)" }}>
            Processed in {data.processingTime}ms · Click any field to edit
          </p>

          {/* AI suggestions */}
          {data.suggestions?.length > 0 && (
            <div className="mt-4 rounded-xl p-4 flex gap-3"
                 style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>
              <span className="text-xl">💡</span>
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: "#a78bfa" }}>AI Suggestions</p>
                <ul className="space-y-1">
                  {data.suggestions.map((s, i) => (
                    <li key={i} className="text-sm" style={{ color: "var(--muted)" }}>• {s}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          {/* Left sidebar */}
          <div className="space-y-4">
            {/* Cover art */}
            <div className="rounded-2xl overflow-hidden aspect-square flex items-center justify-center"
                 style={{ background: "var(--surface)" }}>
              {coverPreview ? (
                <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-8">
                  <div className="text-5xl mb-3">🎵</div>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>No cover art</p>
                </div>
              )}
            </div>

            {/* Audio info */}
            <div className="rounded-2xl p-4 space-y-3" style={{ background: "var(--surface)" }}>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Audio Info</p>
              {[
                ["File", filename],
                ["Duration", fmtDuration(data.audioInfo.duration)],
                ["Format", data.audioInfo.format],
                ["Bitrate", data.audioInfo.bitrate ? `${Math.round(data.audioInfo.bitrate / 1000)} kbps` : "—"],
                ["Sample Rate", data.audioInfo.sampleRate ? `${data.audioInfo.sampleRate / 1000} kHz` : "—"],
                ["Channels", data.audioInfo.channels === 2 ? "Stereo" : data.audioInfo.channels === 1 ? "Mono" : String(data.audioInfo.channels || "—")],
                ["Size", `${(data.audioInfo.fileSize / (1024 * 1024)).toFixed(1)} MB`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span style={{ color: "var(--muted)" }}>{k}</span>
                  <span className="font-medium text-right max-w-[60%] truncate">{v}</span>
                </div>
              ))}
            </div>

            {/* IDs */}
            <div className="rounded-2xl p-4 space-y-3" style={{ background: "var(--surface)" }}>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Generated IDs</p>
              {[
                ["ISRC", metadata.isrc],
                ["UPC", metadata.upc],
                ["ISWC", metadata.iswc],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs items-center gap-2">
                  <span style={{ color: "var(--muted)" }}>{k}</span>
                  <span className="font-mono font-medium"
                        style={{ color: "#a78bfa", fontSize: "10px" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: metadata fields */}
          <div>
            {/* Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {(["core", "advanced", "pitch", "ids"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)}
                        className="px-4 py-2 rounded-xl text-sm font-semibold transition-all capitalize"
                        style={tab === t
                          ? { background: "rgba(124,58,237,0.3)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.4)" }
                          : { background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)" }}>
                  {t === "ids" ? "IDs & Rights" : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {tab === "core" && (
                <>
                  <Field label="Title" aiKey="title" value={metadata.title || ""} confidence={conf.title || 0.9} generated={gen.title} onChange={update} />
                  <Field label="Artist" aiKey="artist" value={metadata.artist || ""} confidence={conf.artist || 0.9} generated={gen.artist} onChange={update} />
                  <Field label="Featured Artists" aiKey="featuredArtists" value={metadata.featuredArtists || []} confidence={conf.featuredArtists || 0.5} generated={gen.featuredArtists} onChange={update} />
                  <Field label="Album / Single" aiKey="album" value={metadata.album || ""} confidence={conf.album || 0.8} generated={gen.album} onChange={update} />
                  <Field label="Genre" aiKey="genre" value={metadata.genre || ""} confidence={conf.genre || 0.85} generated={gen.genre} onChange={update} />
                  <Field label="Sub-Genre" aiKey="subGenre" value={metadata.subGenre || ""} confidence={conf.subGenre || 0.75} generated={gen.subGenre} onChange={update} />
                  <Field label="Mood" aiKey="mood" value={mood} confidence={conf.mood || 0.8} generated={gen.mood} onChange={update} />
                  <Field label="Energy" aiKey="energy" value={metadata.energy || ""} confidence={conf.energy || 0.8} generated={gen.energy} onChange={update} />
                  <Field label="BPM" aiKey="bpm" value={metadata.bpm ?? ""} confidence={conf.bpm || 0.9} generated={gen.bpm} onChange={update} type="number" />
                  <Field label="Key" aiKey="key" value={metadata.key || ""} confidence={conf.key || 0.85} generated={gen.key} onChange={update} />
                  <Field label="Language" aiKey="language" value={metadata.language || "en"} confidence={conf.language || 0.9} generated={gen.language} onChange={update} />
                  <Field label="Explicit" aiKey="explicit" value={metadata.explicit ? "Yes" : "No"} confidence={conf.explicit || 0.95} generated={gen.explicit} onChange={update} />
                </>
              )}

              {tab === "advanced" && (
                <>
                  <Field label="Album Artist" aiKey="albumArtist" value={metadata.albumArtist || ""} confidence={0.9} generated={false} onChange={update} />
                  <Field label="Track Number" aiKey="trackNumber" value={metadata.trackNumber ?? ""} confidence={0.95} generated={false} onChange={update} type="number" />
                  <Field label="Total Tracks" aiKey="totalTracks" value={metadata.totalTracks ?? ""} confidence={0.9} generated={false} onChange={update} type="number" />
                  <Field label="Disc Number" aiKey="discNumber" value={metadata.discNumber ?? ""} confidence={0.9} generated={false} onChange={update} type="number" />
                  <Field label="Label" aiKey="label" value={metadata.label || ""} confidence={conf.label || 0.8} generated={gen.label} onChange={update} />
                  <Field label="Copyright" aiKey="copyright" value={metadata.copyright || ""} confidence={conf.copyright || 0.9} generated={gen.copyright} onChange={update} />
                  <Field label="Release Date" aiKey="releaseDate" value={metadata.releaseDate || ""} confidence={conf.releaseDate || 0.8} generated={gen.releaseDate} onChange={update} type="date" />
                  <Field label="Preview Start (sec)" aiKey="previewStartSeconds" value={metadata.previewStartSeconds ?? 30} confidence={conf.previewStartSeconds || 0.7} generated={gen.previewStartSeconds} onChange={update} type="number" />
                  <div className="sm:col-span-2">
                    <Field label="Lyrics" aiKey="lyrics" value={metadata.lyrics || ""} confidence={0.5} generated={false} onChange={update} multiline />
                  </div>
                </>
              )}

              {tab === "pitch" && (
                <>
                  <div className="sm:col-span-2">
                    <Field label="Spotify Editorial Pitch" aiKey="spotifyPitch" value={metadata.spotifyPitch || ""} confidence={conf.spotifyPitch || 0.85} generated={gen.spotifyPitch} onChange={update} multiline />
                  </div>
                  <div className="sm:col-span-2">
                    <Field label="Apple Music Pitch" aiKey="applePitch" value={metadata.applePitch || ""} confidence={conf.applePitch || 0.82} generated={gen.applePitch} onChange={update} multiline />
                  </div>
                  <div className="sm:col-span-2 rounded-xl p-4" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                    <p className="text-sm font-semibold mb-2" style={{ color: "#34d399" }}>💡 Pitch tips</p>
                    <ul className="text-sm space-y-1" style={{ color: "var(--muted)" }}>
                      <li>• Submit 7+ days before release date for Spotify editorial consideration</li>
                      <li>• Mention specific playlists you&apos;re targeting (e.g. &quot;New Music Friday&quot;, &quot;Brain Food&quot;)</li>
                      <li>• Include any notable collaborations, press, or sync placements</li>
                    </ul>
                  </div>
                </>
              )}

              {tab === "ids" && (
                <>
                  <Field label="ISRC" aiKey="isrc" value={metadata.isrc || ""} confidence={1.0} generated={!metadata.isrc?.startsWith("US")} onChange={update} />
                  <Field label="UPC / EAN" aiKey="upc" value={metadata.upc || ""} confidence={1.0} generated={true} onChange={update} />
                  <Field label="ISWC" aiKey="iswc" value={metadata.iswc || ""} confidence={1.0} generated={true} onChange={update} />
                  <Field label="Territories" aiKey="territories" value={typeof metadata.territories === "string" ? metadata.territories : "worldwide"} confidence={1.0} generated={true} onChange={update} />
                  <Field label="Price Category" aiKey="priceCategory" value={metadata.priceCategory || "standard"} confidence={1.0} generated={true} onChange={update} />
                  <div className="sm:col-span-2 rounded-xl p-4" style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)" }}>
                    <p className="text-sm font-semibold mb-1" style={{ color: "#06b6d4" }}>About these IDs</p>
                    <p className="text-sm" style={{ color: "var(--muted)" }}>
                      ISRC uniquely identifies your recording. UPC identifies your release (album/single). ISWC identifies the underlying composition.
                      All three are auto-generated and embedded before delivery to DSPs.
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="mt-8 flex gap-4">
              <Link href="/upload" className="px-6 py-3 rounded-xl text-sm font-semibold transition-colors"
                    style={{ background: "var(--surface2)", color: "var(--muted)", border: "1px solid var(--border)" }}>
                ← Re-upload
              </Link>
              <button onClick={proceed}
                      className="flex-1 py-3 rounded-xl font-bold text-white transition-all hover:scale-[1.01]"
                      style={{ background: "linear-gradient(135deg, #7c3aed, #5b21b6)" }}>
                Looks good — choose platforms →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
