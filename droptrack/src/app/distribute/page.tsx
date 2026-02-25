"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PLATFORMS, DEFAULT_SELECTED } from "@/lib/platforms";
import type { TrackMetadata } from "@/lib/types";

export default function DistributePage() {
  const router = useRouter();
  const [metadata, setMetadata] = useState<Partial<TrackMetadata> | null>(null);
  const [coverUrl, setCoverUrl] = useState<string>("");
  const [selected, setSelected] = useState<Set<string>>(new Set(DEFAULT_SELECTED));
  const [releaseDate, setReleaseDate] = useState("");
  const [distributing, setDistributing] = useState(false);
  const [result, setResult] = useState<{ releaseId: string; message: string; estimatedLiveAt: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("droptrack_metadata");
    if (!raw) { router.push("/upload"); return; }
    const m = JSON.parse(raw) as Partial<TrackMetadata>;
    setMetadata(m);
    setCoverUrl(sessionStorage.getItem("droptrack_cover") || "");
    setReleaseDate(m.releaseDate || new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]);
  }, [router]);

  const toggle = (id: string) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(PLATFORMS.map((p) => p.id)));
  const selectNone = () => setSelected(new Set());
  const selectMajor = () => setSelected(new Set(PLATFORMS.filter((p) => p.tier === "major").map((p) => p.id)));

  const distribute = async () => {
    if (selected.size === 0) { setError("Select at least one platform."); return; }
    setDistributing(true);
    setError(null);
    try {
      const res = await fetch("/api/distribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metadata, platforms: Array.from(selected), releaseDate }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      // Store release info for dashboard
      const releases = JSON.parse(localStorage.getItem("droptrack_releases") || "[]");
      releases.unshift({
        id: data.releaseId,
        title: metadata?.title || "Unknown",
        artist: metadata?.artist || "Unknown",
        coverUrl: coverUrl,
        status: "distributing",
        platforms: Array.from(selected),
        submittedAt: new Date().toISOString(),
        liveAt: data.estimatedLiveAt,
        streams: 0,
        revenue: 0,
      });
      localStorage.setItem("droptrack_releases", JSON.stringify(releases));
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Distribution failed");
    } finally {
      setDistributing(false);
    }
  };

  if (!metadata) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="w-10 h-10 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--bg)", color: "var(--text)" }}>
        <div className="max-w-lg w-full text-center">
          <div className="text-7xl mb-6">🚀</div>
          <h1 className="text-4xl font-black tracking-tight mb-4">
            You&apos;re <span className="gradient-text">live!</span>
          </h1>
          <p className="text-lg mb-2" style={{ color: "var(--muted)" }}>{result.message}</p>
          <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>
            Estimated live:{" "}
            <span className="text-white font-semibold">
              {new Date(result.estimatedLiveAt).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </span>
          </p>

          {/* Platform badges */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {PLATFORMS.filter((p) => selected.has(p.id)).map((p) => (
              <span key={p.id} className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ background: `${p.color}22`, color: p.color, border: `1px solid ${p.color}44` }}>
                {p.logo} {p.name}
              </span>
            ))}
          </div>

          <div className="flex gap-4 justify-center">
            <Link href="/dashboard"
                  className="px-6 py-3 rounded-xl font-bold text-sm text-white transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #5b21b6)" }}>
              View Dashboard →
            </Link>
            <Link href="/upload"
                  className="px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
                  style={{ background: "var(--surface2)", color: "var(--muted)", border: "1px solid var(--border)" }}>
              Upload another track
            </Link>
          </div>

          <p className="mt-8 text-xs" style={{ color: "var(--muted)" }}>
            Release ID: <span className="font-mono">{result.releaseId}</span>
          </p>
        </div>
      </div>
    );
  }

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
          <span className="opacity-40">Review</span>
          <span>→</span>
          <span className="px-3 py-1 rounded-full font-semibold" style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa" }}>Distribute</span>
        </div>
        <button onClick={distribute} disabled={distributing || selected.size === 0}
                className="px-5 py-2 rounded-xl font-bold text-sm text-white transition-all hover:scale-105 disabled:opacity-40 disabled:scale-100"
                style={{ background: "linear-gradient(135deg, #7c3aed, #5b21b6)" }}>
          {distributing ? "Distributing..." : `Distribute to ${selected.size} platforms`}
        </button>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Track summary */}
        <div className="rounded-2xl p-6 mb-8 flex items-center gap-5"
             style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
               style={{ background: "linear-gradient(135deg, #7c3aed44, #06b6d444)" }}>
            {coverUrl ? (
              <img src={coverUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl">🎵</span>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-black">{metadata.title || "Untitled"}</h2>
            <p style={{ color: "var(--muted)" }}>{metadata.artist} · {metadata.genre}</p>
            <div className="flex gap-3 mt-1 text-xs" style={{ color: "var(--muted)" }}>
              {metadata.bpm && <span>♩ {metadata.bpm} BPM</span>}
              {metadata.key && <span>🎵 {metadata.key}</span>}
              {metadata.isrc && <span className="font-mono">{metadata.isrc}</span>}
            </div>
          </div>
          <Link href="/review" className="text-sm px-3 py-1 rounded-lg"
                style={{ background: "var(--surface2)", color: "var(--muted)", border: "1px solid var(--border)" }}>
            Edit ←
          </Link>
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          {/* Platform grid */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black">Choose platforms</h2>
                <p className="text-sm" style={{ color: "var(--muted)" }}>{selected.size} of {PLATFORMS.length} selected</p>
              </div>
              <div className="flex gap-2 text-xs">
                <button onClick={selectAll} className="px-3 py-1.5 rounded-lg transition-colors"
                        style={{ background: "var(--surface2)", color: "var(--muted)", border: "1px solid var(--border)" }}>
                  All
                </button>
                <button onClick={selectMajor} className="px-3 py-1.5 rounded-lg transition-colors"
                        style={{ background: "rgba(124,58,237,0.15)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.3)" }}>
                  Major
                </button>
                <button onClick={selectNone} className="px-3 py-1.5 rounded-lg transition-colors"
                        style={{ background: "var(--surface2)", color: "var(--muted)", border: "1px solid var(--border)" }}>
                  None
                </button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {PLATFORMS.map((p) => {
                const on = selected.has(p.id);
                return (
                  <button key={p.id} onClick={() => toggle(p.id)}
                          className="flex items-center gap-4 p-4 rounded-2xl text-left transition-all hover:scale-[1.02]"
                          style={{
                            background: on ? `${p.color}18` : "var(--surface)",
                            border: `1px solid ${on ? p.color + "55" : "var(--border)"}`,
                          }}>
                    <span className="text-2xl">{p.logo}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{p.name}</p>
                        {p.tier === "major" && (
                          <span className="text-xs px-1.5 py-0.5 rounded font-semibold"
                                style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa" }}>Major</span>
                        )}
                      </div>
                      <p className="text-xs" style={{ color: "var(--muted)" }}>{p.monthlyUsers} users</p>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                         style={{ borderColor: on ? p.color : "var(--border)", background: on ? p.color : "transparent" }}>
                      {on && <span className="text-white text-xs">✓</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right panel */}
          <div className="space-y-4">
            {/* Release date */}
            <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <h3 className="font-bold mb-4">Release Date</h3>
              <input type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)}
                     className="w-full px-4 py-3 rounded-xl text-sm outline-none font-medium"
                     style={{ background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)" }} />
              <p className="text-xs mt-2" style={{ color: "var(--muted)" }}>
                Submit 7+ days early for Spotify editorial consideration
              </p>
            </div>

            {/* Distribution summary */}
            <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <h3 className="font-bold mb-4">Summary</h3>
              <div className="space-y-3 text-sm">
                {[
                  ["Track", metadata.title || "—"],
                  ["Artist", metadata.artist || "—"],
                  ["ISRC", metadata.isrc || "—"],
                  ["UPC", metadata.upc || "—"],
                  ["Platforms", `${selected.size} platforms`],
                  ["Territories", typeof metadata.territories === "string" ? metadata.territories : "worldwide"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center">
                    <span style={{ color: "var(--muted)" }}>{k}</span>
                    <span className="font-semibold text-right max-w-[60%] truncate">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl text-sm"
                   style={{ background: "rgba(239,68,68,0.1)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)" }}>
                {error}
              </div>
            )}

            <button onClick={distribute} disabled={distributing || selected.size === 0}
                    className="w-full py-4 rounded-2xl font-bold text-lg text-white transition-all hover:scale-[1.02] disabled:opacity-40 disabled:scale-100"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #5b21b6)" }}>
              {distributing ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Distributing...
                </span>
              ) : (
                `🚀 Distribute to ${selected.size} platforms`
              )}
            </button>
            <p className="text-xs text-center" style={{ color: "var(--muted)" }}>
              Your music will be live within 24 hours
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
