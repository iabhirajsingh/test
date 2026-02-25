"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PLATFORMS } from "@/lib/platforms";

interface Release {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  status: string;
  platforms: string[];
  submittedAt: string;
  liveAt: string | null;
  streams: number;
  revenue: number;
}

const DEMO_RELEASES: Release[] = [
  {
    id: "REL-DEMO-001",
    title: "Midnight Frequencies",
    artist: "AURIS",
    coverUrl: "",
    status: "live",
    platforms: ["spotify", "apple_music", "youtube_music", "amazon_music", "tidal", "deezer"],
    submittedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    liveAt: new Date(Date.now() - 28 * 86400000).toISOString(),
    streams: 48291,
    revenue: 193.16,
  },
  {
    id: "REL-DEMO-002",
    title: "Solstice",
    artist: "AURIS",
    coverUrl: "",
    status: "live",
    platforms: ["spotify", "apple_music", "tidal", "soundcloud"],
    submittedAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    liveAt: new Date(Date.now() - 58 * 86400000).toISOString(),
    streams: 124008,
    revenue: 496.03,
  },
  {
    id: "REL-DEMO-003",
    title: "Glass Cities",
    artist: "AURIS",
    coverUrl: "",
    status: "distributing",
    platforms: ["spotify", "apple_music", "youtube_music", "amazon_music", "tidal", "deezer", "pandora"],
    submittedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    liveAt: new Date(Date.now() + 86400000).toISOString(),
    streams: 0,
    revenue: 0,
  },
];

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  live:         { bg: "rgba(16,185,129,0.15)",  color: "#34d399", label: "Live" },
  distributing: { bg: "rgba(245,158,11,0.15)",  color: "#fbbf24", label: "Distributing" },
  processing:   { bg: "rgba(99,102,241,0.15)",  color: "#a78bfa", label: "Processing" },
  reviewing:    { bg: "rgba(6,182,212,0.15)",   color: "#22d3ee", label: "Reviewing" },
  rejected:     { bg: "rgba(239,68,68,0.15)",   color: "#f87171", label: "Rejected" },
};

function StreamsChart({ data }: { data: number[] }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-1 h-12">
      {data.map((v, i) => (
        <div key={i} className="flex-1 rounded-sm transition-all"
             style={{ height: `${max > 0 ? (v / max) * 100 : 10}%`, background: "linear-gradient(to top, #7c3aed, #06b6d4)" }} />
      ))}
    </div>
  );
}

function fmtNum(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default function DashboardPage() {
  const [releases, setReleases] = useState<Release[]>(DEMO_RELEASES);
  const [activeRelease, setActiveRelease] = useState<Release | null>(DEMO_RELEASES[1]);

  useEffect(() => {
    const stored = localStorage.getItem("droptrack_releases");
    if (stored) {
      const parsed: Release[] = JSON.parse(stored);
      setReleases([...parsed, ...DEMO_RELEASES]);
    }
  }, []);

  const totalStreams = releases.reduce((sum, r) => sum + r.streams, 0);
  const totalRevenue = releases.reduce((sum, r) => sum + r.revenue, 0);
  const liveCount = releases.filter((r) => r.status === "live").length;

  // Fake weekly streams sparkline
  const weeklyData = [3200, 4100, 5800, 4900, 7200, 8100, 6400, 9200, 8700, 10200, 11800, 9400];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)", color: "var(--text)" }}>
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
        <div className="flex gap-6 text-sm" style={{ color: "var(--muted)" }}>
          <span className="text-white font-semibold border-b-2 border-violet-500 pb-1">Dashboard</span>
          <Link href="/upload" className="hover:text-white transition-colors">Upload</Link>
          <a href="#" className="hover:text-white transition-colors">Analytics</a>
          <a href="#" className="hover:text-white transition-colors">Royalties</a>
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
             style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }}>
          A
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Artist Dashboard</h1>
            <p style={{ color: "var(--muted)" }}>Your releases & royalties</p>
          </div>
          <Link href="/upload"
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #7c3aed, #5b21b6)" }}>
            <span>+</span> Upload track
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {[
            { label: "Total Streams", value: fmtNum(totalStreams), delta: "+12%", icon: "▶" },
            { label: "Revenue (USD)", value: `$${totalRevenue.toFixed(2)}`, delta: "+8%", icon: "$" },
            { label: "Live Releases", value: String(liveCount), delta: "", icon: "🎵" },
            { label: "Platforms", value: "20", delta: "", icon: "🌍" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl p-4 sm:p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs sm:text-sm" style={{ color: "var(--muted)" }}>{stat.label}</span>
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-sm"
                      style={{ background: "rgba(124,58,237,0.2)" }}>{stat.icon}</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black mb-1 truncate">{stat.value}</div>
              {stat.delta && (
                <div className="text-xs font-semibold" style={{ color: "#34d399" }}>{stat.delta} this month</div>
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-6">
          {/* Releases list */}
          <div>
            <h2 className="text-xl font-black mb-4">Your Releases</h2>
            <div className="space-y-3">
              {releases.map((r) => {
                const st = STATUS_STYLES[r.status] || STATUS_STYLES.processing;
                const isActive = activeRelease?.id === r.id;
                return (
                  <button key={r.id} onClick={() => setActiveRelease(r)}
                          className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all"
                          style={{
                            background: isActive ? "rgba(124,58,237,0.1)" : "var(--surface)",
                            border: `1px solid ${isActive ? "rgba(124,58,237,0.4)" : "var(--border)"}`,
                          }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                         style={{ background: "linear-gradient(135deg, #7c3aed44, #06b6d444)" }}>
                      {r.coverUrl ? (
                        <img src={r.coverUrl} alt="" className="w-full h-full rounded-xl object-cover" />
                      ) : (
                        <span className="text-xl">🎵</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold truncate">{r.title}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                              style={{ background: st.bg, color: st.color }}>
                          {st.label}
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: "var(--muted)" }}>
                        {r.artist} · {r.platforms.length} platforms
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {r.streams > 0 && (
                        <>
                          <div className="font-bold text-sm">{fmtNum(r.streams)}</div>
                          <div className="text-xs" style={{ color: "var(--muted)" }}>streams</div>
                        </>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detail panel */}
          {activeRelease && (
            <div className="space-y-4">
              <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center"
                       style={{ background: "linear-gradient(135deg, #7c3aed55, #06b6d455)" }}>
                    {activeRelease.coverUrl ? (
                      <img src={activeRelease.coverUrl} alt="" className="w-full h-full rounded-xl object-cover" />
                    ) : (
                      <span className="text-3xl">🎵</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-black">{activeRelease.title}</h3>
                    <p style={{ color: "var(--muted)" }}>{activeRelease.artist}</p>
                  </div>
                </div>

                {/* Sparkline */}
                {activeRelease.streams > 0 && (
                  <div className="mb-6">
                    <div className="flex justify-between text-xs mb-2" style={{ color: "var(--muted)" }}>
                      <span>Weekly streams</span>
                      <span className="font-semibold text-white">{fmtNum(activeRelease.streams)} total</span>
                    </div>
                    <StreamsChart data={weeklyData} />
                  </div>
                )}

                {/* Platform breakdown */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--muted)" }}>
                    Platforms ({activeRelease.platforms.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {activeRelease.platforms.map((pid) => {
                      const p = PLATFORMS.find((pl) => pl.id === pid);
                      if (!p) return null;
                      return (
                        <span key={pid} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium"
                              style={{ background: `${p.color}22`, color: p.color }}>
                          {p.logo} {p.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Revenue card */}
              {activeRelease.revenue > 0 && (
                <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--muted)" }}>Revenue</p>
                  <div className="text-3xl font-black mb-1">${activeRelease.revenue.toFixed(2)}</div>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>Estimated royalties · Paid monthly</p>
                </div>
              )}

              {/* Timeline */}
              <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "var(--muted)" }}>Timeline</p>
                <div className="space-y-3">
                  {[
                    { label: "Submitted", date: activeRelease.submittedAt, done: true },
                    { label: "AI Metadata", date: activeRelease.submittedAt, done: true },
                    { label: "Distributing", date: activeRelease.submittedAt, done: activeRelease.status !== "processing" },
                    { label: "Live", date: activeRelease.liveAt, done: activeRelease.status === "live" },
                  ].map((step) => (
                    <div key={step.label} className="flex items-center gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                           style={step.done
                             ? { background: "#10b981", color: "white" }
                             : { background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--muted)" }}>
                        {step.done ? "✓" : "○"}
                      </div>
                      <span className={step.done ? "" : "opacity-40"}>{step.label}</span>
                      {step.date && (
                        <span className="ml-auto text-xs" style={{ color: "var(--muted)" }}>
                          {new Date(step.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
