"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

const TICKER_PLATFORMS = [
  "Spotify", "Apple Music", "YouTube Music", "Amazon Music",
  "Tidal", "Deezer", "Pandora", "SoundCloud", "Tencent Music",
  "Boomplay", "Anghami", "iHeartRadio", "Melon", "Qobuz", "NetEase",
];

const COMPARE = [
  { feature: "AI metadata autofill",     droptrack: true,  distrokid: false, tunecore: false, madverse: false },
  { feature: "Auto ISRC / UPC / ISWC",  droptrack: true,  distrokid: false, tunecore: true,  madverse: false },
  { feature: "Mood & BPM detection",    droptrack: true,  distrokid: false, tunecore: false, madverse: false },
  { feature: "Spotify pitch copy (AI)", droptrack: true,  distrokid: false, tunecore: false, madverse: false },
  { feature: "Collaborator splits",     droptrack: true,  distrokid: true,  tunecore: false, madverse: true  },
  { feature: "40+ platforms",           droptrack: true,  distrokid: true,  tunecore: true,  madverse: true  },
  { feature: "Cover art AI tagging",    droptrack: true,  distrokid: false, tunecore: false, madverse: false },
  { feature: "No per-release fee",      droptrack: true,  distrokid: false, tunecore: false, madverse: false },
  { feature: "Release in < 2 minutes",  droptrack: true,  distrokid: false, tunecore: false, madverse: false },
];

const STEPS = [
  { num: "01", title: "Drop your track", desc: "Upload MP3, WAV, or FLAC. We parse every embedded tag instantly." },
  { num: "02", title: "AI fills everything", desc: "Claude analyzes your audio and generates title, genre, mood, BPM, key, ISRC, UPC, pitch copy — all of it." },
  { num: "03", title: "Review in 60 seconds", desc: "Glance at the pre-filled form. Fix anything that's off. Most artists change nothing." },
  { num: "04", title: "Pick platforms & go", desc: "Select your stores. Hit Distribute. Live on 40+ platforms within 24 hours." },
];

function Waveform() {
  return (
    <div className="flex items-end gap-[3px] h-7">
      {[40, 70, 55, 90, 60, 80, 45, 75, 50, 85, 35, 65].map((h, i) => (
        <div
          key={i}
          className="waveform-bar w-[3px] rounded-full"
          style={{ height: `${h}%`, background: "var(--accent2)", animationDelay: `${i * 0.08}s` }}
        />
      ))}
    </div>
  );
}

export default function Landing() {
  const [tick, setTick] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 2200);
    return () => clearInterval(t);
  }, []);

  const activePlatform = TICKER_PLATFORMS[tick % TICKER_PLATFORMS.length];

  return (
    <div style={{ background: "var(--bg)", color: "var(--text)" }}>

      {/* ── Nav ──────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b"
           style={{ borderColor: "var(--border)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                 style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }}>
              <span className="text-white text-sm font-black">D</span>
            </div>
            <span className="font-black text-lg tracking-tight">DropTrack</span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: "var(--muted)" }}>
            <a href="#how"     className="hover:text-white transition-colors">How it works</a>
            <a href="#compare" className="hover:text-white transition-colors">Compare</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/dashboard"
                  className="hidden sm:block text-sm px-4 py-2 rounded-lg font-medium transition-colors hover:text-white"
                  style={{ color: "var(--muted)" }}>
              Sign in
            </Link>
            <Link href="/upload"
                  className="text-sm px-4 py-2 rounded-lg font-bold text-white transition-all hover:opacity-90 whitespace-nowrap"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #5b21b6)" }}>
              Get started
            </Link>
            {/* Mobile menu toggle */}
            <button onClick={() => setMobileMenuOpen((o) => !o)}
                    className="md:hidden p-2 rounded-lg" style={{ color: "var(--muted)" }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                {mobileMenuOpen
                  ? <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  : <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t px-4 py-4 space-y-2"
               style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            {["#how", "#compare", "#pricing"].map((href, i) => (
              <a key={href} href={href} onClick={() => setMobileMenuOpen(false)}
                 className="block py-2 text-sm font-medium hover:text-white transition-colors"
                 style={{ color: "var(--muted)" }}>
                {["How it works", "Compare", "Pricing"][i]}
              </a>
            ))}
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm font-medium hover:text-white transition-colors"
                  style={{ color: "var(--muted)" }}>
              Sign in
            </Link>
          </div>
        )}
      </nav>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center min-h-screen text-center px-5 pt-20 pb-12 overflow-hidden">
        {/* BG orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/3 w-72 sm:w-96 h-72 sm:h-96 rounded-full opacity-10 blur-3xl"
               style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
          <div className="absolute bottom-1/3 right-1/4 w-56 sm:w-72 h-56 sm:h-72 rounded-full opacity-10 blur-3xl"
               style={{ background: "radial-gradient(circle, #06b6d4, transparent)" }} />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-8 glass"
             style={{ border: "1px solid rgba(124,58,237,0.4)", color: "#a78bfa" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          Now live on 40+ streaming platforms
        </div>

        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter mb-6 leading-[0.88]">
          <span className="block">Stop filling</span>
          <span className="block gradient-text">metadata forms.</span>
        </h1>

        <p className="text-lg sm:text-xl md:text-2xl max-w-2xl mb-4 leading-relaxed" style={{ color: "var(--muted)" }}>
          Upload your track. AI reads the audio, fills{" "}
          <em className="not-italic text-white font-semibold">every single field</em>, and distributes to{" "}
          <span className="text-white font-semibold">40+ platforms</span> — in under 2 minutes.
        </p>

        {/* Ticker */}
        <div className="flex items-center gap-3 mb-10 text-sm" style={{ color: "var(--muted)" }}>
          <Waveform />
          <span>
            Distributing to{" "}
            <span key={activePlatform} className="font-semibold fade-in" style={{ color: "var(--accent2)" }}>
              {activePlatform}
            </span>{" "}
            right now
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-sm sm:max-w-none sm:w-auto">
          <Link href="/upload"
                className="group w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg text-white transition-all hover:opacity-90 pulse-glow"
                style={{ background: "linear-gradient(135deg, #7c3aed, #5b21b6)" }}>
            Upload your first track
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
          <a href="#how"
             className="w-full sm:w-auto px-8 py-4 rounded-2xl font-semibold text-sm text-center transition-all hover:text-white glass"
             style={{ color: "var(--muted)" }}>
            See how it works
          </a>
        </div>

        <p className="mt-5 text-xs" style={{ color: "var(--muted)" }}>
          Free for indie artists · No credit card needed
        </p>
      </section>

      {/* ── Mock UI Preview ───────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        {/* Gradient border container */}
        <div className="rounded-3xl p-px" style={{ background: "linear-gradient(135deg, #7c3aed55, #06b6d455)" }}>
          <div className="rounded-3xl p-5 sm:p-8" style={{ background: "var(--surface)" }}>
            {/* Browser chrome */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-3 h-3 rounded-full" style={{ background: "#ef4444", opacity: 0.7 }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "#f59e0b", opacity: 0.7 }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "#10b981", opacity: 0.7 }} />
              <div className="flex-1 mx-3 px-3 py-1 rounded text-xs font-mono"
                   style={{ background: "var(--surface2)", color: "var(--muted)" }}>
                droptrack.io/review
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Left column */}
              <div className="space-y-3">
                {[
                  { label: "Title",  value: "Midnight Frequencies",       ai: 0.97 },
                  { label: "Artist", value: "AURIS",                      ai: 1.00 },
                  { label: "Genre",  value: "Electronic / Ambient",       ai: 0.91 },
                  { label: "Mood",   value: "Dreamy · Introspective · Chill", ai: 0.88 },
                  { label: "BPM",    value: "128",                        ai: 0.99 },
                  { label: "Key",    value: "A minor",                    ai: 0.95 },
                ].map(({ label, value, ai }) => (
                  <div key={label} className="rounded-xl p-3 sm:p-4" style={{ background: "var(--surface2)" }}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>{label}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                            style={{ background: "rgba(16,185,129,0.15)", color: "#34d399" }}>
                        AI {Math.round(ai * 100)}%
                      </span>
                    </div>
                    <div className="font-semibold text-sm">{value}</div>
                  </div>
                ))}
              </div>

              {/* Right column */}
              <div className="space-y-3">
                {[
                  { label: "ISRC",         value: "US-TRA-26-00412" },
                  { label: "UPC",          value: "638592041872" },
                  { label: "Language",     value: "English" },
                  { label: "Explicit",     value: "Clean" },
                  { label: "Release Date", value: "March 1, 2026" },
                  { label: "Spotify Pitch", value: "A hypnotic journey through textured synths and evolving pads — perfect for late-night focus and playlists like Brain Food." },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl p-3 sm:p-4" style={{ background: "var(--surface2)" }}>
                    <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--muted)" }}>{label}</div>
                    <div className="font-semibold text-sm leading-relaxed">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <p className="text-center mt-4 text-sm" style={{ color: "var(--muted)" }}>
          ↑ AI filled every field. You didn&apos;t type a thing.
        </p>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section id="how" className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
            From upload to live in <span className="gradient-text">4 steps</span>
          </h2>
          <p className="text-base sm:text-lg" style={{ color: "var(--muted)" }}>
            DistroKid has 37 fields to fill manually. We have zero.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((step) => (
            <div key={step.num} className="glass rounded-2xl p-6 transition-colors hover:border-violet-500/30">
              <div className="text-4xl font-black mb-4 gradient-text">{step.num}</div>
              <h3 className="font-bold text-base mb-2">{step.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Comparison ───────────────────────────────────── */}
      <section id="compare" className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
            The others are <span className="gradient-text">stuck in 2012</span>
          </h2>
          <p className="text-base sm:text-lg" style={{ color: "var(--muted)" }}>
            Every competitor still makes you fill forms. We made AI do it.
          </p>
        </div>

        {/* Scrollable wrapper for small screens */}
        <div className="overflow-x-auto rounded-2xl" style={{ border: "1px solid var(--border)" }}>
          <table className="w-full min-w-[560px]" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--surface2)" }}>
                <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider w-1/3"
                    style={{ color: "var(--muted)" }}>Feature</th>
                <th className="px-5 py-4 text-xs font-black text-center" style={{ color: "#a78bfa" }}>DropTrack</th>
                <th className="px-5 py-4 text-xs font-bold text-center uppercase tracking-wider" style={{ color: "var(--muted)" }}>DistroKid</th>
                <th className="px-5 py-4 text-xs font-bold text-center uppercase tracking-wider" style={{ color: "var(--muted)" }}>TuneCore</th>
                <th className="px-5 py-4 text-xs font-bold text-center uppercase tracking-wider" style={{ color: "var(--muted)" }}>Madverse</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((row, i) => (
                <tr key={row.feature}
                    style={{ background: i % 2 === 0 ? "var(--surface)" : "var(--surface2)", borderTop: "1px solid var(--border)" }}>
                  <td className="px-5 py-3.5 text-sm" style={{ color: "var(--muted)" }}>{row.feature}</td>
                  {[row.droptrack, row.distrokid, row.tunecore, row.madverse].map((v, j) => (
                    <td key={j} className="px-5 py-3.5 text-center text-lg">
                      {v
                        ? <span style={{ color: j === 0 ? "#34d399" : "var(--muted)" }}>{j === 0 ? "✓" : "✓"}</span>
                        : <span style={{ color: "var(--border)" }}>✗</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────── */}
      <section id="pricing" className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
            Simple, <span className="gradient-text">artist-first</span> pricing
          </h2>
          <p style={{ color: "var(--muted)" }}>No per-release fees. No highway robbery on your royalties.</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {[
            {
              name: "Free",  price: "$0",  period: "forever",
              features: ["3 releases / year", "20 platforms", "AI metadata autofill", "ISRC / UPC generation", "Basic analytics"],
              cta: "Start free", highlighted: false,
            },
            {
              name: "Pro",   price: "$9",  period: "/ month",
              features: ["Unlimited releases", "40+ platforms", "AI metadata autofill", "Priority distribution", "Advanced analytics", "Collaborator splits", "Playlist pitching AI"],
              cta: "Go Pro", highlighted: true,
            },
            {
              name: "Label", price: "$29", period: "/ month",
              features: ["Everything in Pro", "Unlimited artists", "White-label dashboard", "API access", "Dedicated support", "Custom splits engine"],
              cta: "Contact us", highlighted: false,
            },
          ].map((plan) => (
            <div key={plan.name}
                 className="rounded-2xl p-7 flex flex-col"
                 style={plan.highlighted
                   ? { background: "var(--surface)", border: "1px solid rgba(124,58,237,0.5)", boxShadow: "0 0 40px rgba(124,58,237,0.2)" }
                   : { background: "var(--surface)", border: "1px solid var(--border)" }}>
              {plan.highlighted && (
                <div className="text-xs font-bold mb-4 px-3 py-1 rounded-full self-start"
                     style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa" }}>
                  Most popular
                </div>
              )}
              <div className="font-bold text-base mb-1">{plan.name}</div>
              <div className="mb-6">
                <span className="text-4xl font-black">{plan.price}</span>
                <span className="text-sm ml-1" style={{ color: "var(--muted)" }}>{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm">
                    <span className="flex-shrink-0" style={{ color: "var(--green)" }}>✓</span>
                    <span style={{ color: "var(--muted)" }}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/upload"
                    className="w-full py-3 rounded-xl font-bold text-sm text-center transition-all hover:opacity-90"
                    style={plan.highlighted
                      ? { background: "linear-gradient(135deg, #7c3aed, #5b21b6)", color: "white" }
                      : { background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)" }}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
        <div className="rounded-3xl p-10 sm:p-14 text-center"
             style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.18), rgba(6,182,212,0.08))", border: "1px solid rgba(124,58,237,0.25)" }}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4 leading-tight">
            Your music deserves to be heard,{" "}
            <span className="gradient-text">not buried in forms.</span>
          </h2>
          <p className="mb-8 text-base sm:text-lg" style={{ color: "var(--muted)" }}>
            Join thousands of artists already using DropTrack.
          </p>
          <Link href="/upload"
                className="inline-flex items-center gap-3 px-8 sm:px-12 py-4 rounded-2xl font-bold text-base sm:text-lg text-white transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #7c3aed, #5b21b6)" }}>
            Upload your first track — it&apos;s free →
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t px-6 py-10 text-center text-sm"
              style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
        <div className="flex items-center justify-center gap-2.5 mb-3">
          <div className="w-5 h-5 rounded flex items-center justify-center"
               style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }}>
            <span className="text-white text-xs font-black">D</span>
          </div>
          <span className="font-black text-white">DropTrack</span>
        </div>
        <p>© 2026 DropTrack · Built for artists, not labels.</p>
      </footer>
    </div>
  );
}
