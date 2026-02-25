"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

const PLATFORMS = [
  "Spotify", "Apple Music", "YouTube Music", "Amazon Music",
  "Tidal", "Deezer", "Pandora", "SoundCloud", "Qobuz",
  "Tencent", "Boomplay", "Anghami", "iHeartRadio", "Melon",
];

const COMPARE = [
  { feature: "AI metadata autofill",    droptrack: true,  distrokid: false, tunecore: false, madverse: false },
  { feature: "Auto ISRC/UPC/ISWC gen", droptrack: true,  distrokid: false, tunecore: true,  madverse: false },
  { feature: "Mood & BPM detection",   droptrack: true,  distrokid: false, tunecore: false, madverse: false },
  { feature: "Spotify pitch copy AI",  droptrack: true,  distrokid: false, tunecore: false, madverse: false },
  { feature: "Collaborator splits",    droptrack: true,  distrokid: true,  tunecore: false, madverse: true  },
  { feature: "40+ platforms",          droptrack: true,  distrokid: true,  tunecore: true,  madverse: true  },
  { feature: "Cover art AI tagging",   droptrack: true,  distrokid: false, tunecore: false, madverse: false },
  { feature: "No per-release fee",     droptrack: true,  distrokid: false, tunecore: false, madverse: false },
  { feature: "Release in < 2 minutes", droptrack: true,  distrokid: false, tunecore: false, madverse: false },
];

const STEPS = [
  { num: "01", title: "Drop your track", desc: "Upload MP3, WAV, or FLAC. We parse every embedded tag instantly." },
  { num: "02", title: "AI fills everything", desc: "Claude analyzes your audio and auto-generates title, genre, mood, BPM, key, ISRC, UPC, pitch copy — all of it." },
  { num: "03", title: "Review in 60 seconds", desc: "Glance at the pre-filled form. Fix anything that's off. Most artists change nothing." },
  { num: "04", title: "Pick platforms & go", desc: "Select your stores. Hit Distribute. Your music is live on 40+ platforms within 24 hours." },
];

function WaveformIcon() {
  return (
    <div className="flex items-end gap-[3px] h-8">
      {[40, 70, 55, 90, 60, 80, 45, 75, 50, 85, 35, 65].map((h, i) => (
        <div
          key={i}
          className="waveform-bar w-[3px] rounded-full bg-violet-500"
          style={{ height: `${h}%`, animationDelay: `${i * 0.08}s` }}
        />
      ))}
    </div>
  );
}

export default function Landing() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 2000);
    return () => clearInterval(t);
  }, []);

  const activePlatform = PLATFORMS[tick % PLATFORMS.length];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)", color: "var(--text)" }}>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 glass border-b"
           style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
               style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }}>
            <span className="text-white text-sm font-bold">D</span>
          </div>
          <span className="font-bold text-lg tracking-tight">DropTrack</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: "var(--muted)" }}>
          <a href="#how" className="hover:text-white transition-colors">How it works</a>
          <a href="#compare" className="hover:text-white transition-colors">Compare</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard"
                className="text-sm px-4 py-2 rounded-lg transition-colors hover:text-white"
                style={{ color: "var(--muted)" }}>
            Sign in
          </Link>
          <Link href="/upload"
                className="text-sm px-4 py-2 rounded-lg font-semibold text-white transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #7c3aed, #5b21b6)" }}>
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-screen text-center px-6 pt-24 overflow-hidden">
        {/* BG orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full opacity-10 blur-3xl"
               style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
          <div className="absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full opacity-10 blur-3xl"
               style={{ background: "radial-gradient(circle, #06b6d4, transparent)" }} />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-8 glass"
             style={{ border: "1px solid rgba(124,58,237,0.4)", color: "#a78bfa" }}>
          <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
          Now distributing to {PLATFORMS.length}+ platforms
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-[0.9]">
          <span className="block">Stop filling</span>
          <span className="block gradient-text">metadata forms.</span>
        </h1>
        <p className="text-xl md:text-2xl max-w-2xl mb-4" style={{ color: "var(--muted)" }}>
          Upload your track. AI reads the audio, fills <em>every single field</em>, and distributes to{" "}
          <span className="text-white font-semibold">40+ platforms</span> — in under 2 minutes.
        </p>

        {/* Live platform ticker */}
        <div className="flex items-center gap-3 mb-12 text-sm" style={{ color: "var(--muted)" }}>
          <WaveformIcon />
          <span>
            Distributing to{" "}
            <span key={activePlatform} className="font-semibold fade-in" style={{ color: "var(--accent2)" }}>
              {activePlatform}
            </span>{" "}
            right now
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link href="/upload"
                className="group flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg text-white transition-all hover:scale-105 pulse-glow"
                style={{ background: "linear-gradient(135deg, #7c3aed, #5b21b6)" }}>
            <span>Upload your first track</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
          <a href="#how"
             className="px-8 py-4 rounded-2xl font-semibold text-sm transition-all hover:text-white glass"
             style={{ color: "var(--muted)" }}>
            See how it works
          </a>
        </div>

        <p className="mt-6 text-xs" style={{ color: "var(--muted)" }}>
          Free forever for indie artists · No credit card needed
        </p>
      </section>

      {/* Mock UI Preview */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="rounded-3xl overflow-hidden gradient-border p-px">
          <div className="rounded-3xl p-8" style={{ background: "var(--surface)" }}>
            {/* Fake browser bar */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-red-500 opacity-70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-70" />
              <div className="w-3 h-3 rounded-full bg-green-500 opacity-70" />
              <div className="flex-1 mx-4 px-4 py-1 rounded text-xs" style={{ background: "var(--surface2)", color: "var(--muted)" }}>
                droptrack.io/review
              </div>
            </div>
            {/* Fake metadata card */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {[
                  { label: "Title", value: "Midnight Frequencies", ai: 0.97 },
                  { label: "Artist", value: "AURIS", ai: 1.0 },
                  { label: "Genre", value: "Electronic / Ambient", ai: 0.91 },
                  { label: "Mood", value: "Dreamy · Introspective · Chill", ai: 0.88 },
                  { label: "BPM", value: "128", ai: 0.99 },
                  { label: "Key", value: "A minor", ai: 0.95 },
                ].map(({ label, value, ai }) => (
                  <div key={label} className="rounded-xl p-4" style={{ background: "var(--surface2)" }}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>{label}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: "rgba(16,185,129,0.15)", color: "#34d399" }}>
                        AI {Math.round(ai * 100)}%
                      </span>
                    </div>
                    <div className="font-semibold text-sm">{value}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {[
                  { label: "ISRC", value: "US-TRA-26-00412" },
                  { label: "UPC", value: "638592041872" },
                  { label: "Language", value: "English" },
                  { label: "Explicit", value: "Clean" },
                  { label: "Release Date", value: "March 1, 2026" },
                  { label: "Spotify Pitch", value: "A hypnotic journey through textured synths and evolving pads — perfect for late-night focus and editorial playlists like Brain Food and Electronic Concentration." },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl p-4" style={{ background: "var(--surface2)" }}>
                    <div className="text-xs font-medium mb-1" style={{ color: "var(--muted)" }}>{label}</div>
                    <div className="font-semibold text-sm leading-relaxed">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <p className="text-center mt-4 text-sm" style={{ color: "var(--muted)" }}>
          ↑ Everything above was filled by AI. You didn&apos;t type a thing.
        </p>
      </section>

      {/* How it works */}
      <section id="how" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black tracking-tight mb-4">From upload to live in{" "}
            <span className="gradient-text">4 steps</span>
          </h2>
          <p className="text-lg" style={{ color: "var(--muted)" }}>
            DistroKid has 37 fields to fill manually. We have zero.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step) => (
            <div key={step.num} className="glass rounded-2xl p-6 hover:border-violet-500/40 transition-colors">
              <div className="text-4xl font-black mb-4 gradient-text">{step.num}</div>
              <h3 className="font-bold text-lg mb-2">{step.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Competitor comparison */}
      <section id="compare" className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black tracking-tight mb-4">
            The others are <span className="gradient-text">stuck in 2012</span>
          </h2>
          <p className="text-lg" style={{ color: "var(--muted)" }}>
            Every competitor still makes you fill forms. We made AI do it.
          </p>
        </div>
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          {/* Header */}
          <div className="grid grid-cols-5 text-xs font-bold px-6 py-4"
               style={{ background: "var(--surface2)", color: "var(--muted)" }}>
            <div className="col-span-1">Feature</div>
            <div className="text-center font-black text-violet-400">DropTrack</div>
            <div className="text-center">DistroKid</div>
            <div className="text-center">TuneCore</div>
            <div className="text-center">Madverse</div>
          </div>
          {COMPARE.map((row, i) => (
            <div key={row.feature}
                 className="grid grid-cols-5 items-center px-6 py-4 text-sm"
                 style={{ background: i % 2 === 0 ? "var(--surface)" : "var(--surface2)", borderTop: "1px solid var(--border)" }}>
              <div style={{ color: "var(--muted)" }}>{row.feature}</div>
              {[row.droptrack, row.distrokid, row.tunecore, row.madverse].map((v, j) => (
                <div key={j} className="text-center">
                  {v
                    ? <span className="text-xl">{j === 0 ? "✅" : "✓"}</span>
                    : <span className="text-xl opacity-30">✗</span>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black tracking-tight mb-4">
            Simple, <span className="gradient-text">artist-first</span> pricing
          </h2>
          <p style={{ color: "var(--muted)" }}>No per-release fees. No highway robbery on your royalties.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              name: "Free",
              price: "$0",
              period: "forever",
              features: ["3 releases/year", "20 platforms", "AI metadata autofill", "ISRC/UPC generation", "Basic analytics"],
              cta: "Start free",
              highlighted: false,
            },
            {
              name: "Pro",
              price: "$9",
              period: "/month",
              features: ["Unlimited releases", "40+ platforms", "AI metadata autofill", "Priority distribution", "Advanced analytics", "Collaborator splits", "Playlist pitching AI"],
              cta: "Go Pro",
              highlighted: true,
            },
            {
              name: "Label",
              price: "$29",
              period: "/month",
              features: ["Everything in Pro", "Unlimited artists", "White-label dashboard", "API access", "Dedicated support", "Custom splits engine"],
              cta: "Contact us",
              highlighted: false,
            },
          ].map((plan) => (
            <div key={plan.name}
                 className={`rounded-2xl p-8 flex flex-col ${plan.highlighted ? "gradient-border pulse-glow" : "glass"}`}>
              {plan.highlighted && (
                <div className="text-xs font-bold mb-4 px-3 py-1 rounded-full self-start"
                     style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa" }}>
                  Most popular
                </div>
              )}
              <div className="font-bold text-lg mb-1">{plan.name}</div>
              <div className="mb-6">
                <span className="text-4xl font-black">{plan.price}</span>
                <span className="text-sm" style={{ color: "var(--muted)" }}>{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <span style={{ color: "var(--green)" }}>✓</span>
                    <span style={{ color: "var(--muted)" }}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/upload"
                    className="w-full py-3 rounded-xl font-bold text-sm text-center transition-all hover:scale-105"
                    style={plan.highlighted
                      ? { background: "linear-gradient(135deg, #7c3aed, #5b21b6)", color: "white" }
                      : { background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)" }}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="rounded-3xl p-12 text-center relative overflow-hidden"
             style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.1))", border: "1px solid rgba(124,58,237,0.3)" }}>
          <div className="absolute inset-0 pointer-events-none opacity-5"
               style={{ background: "radial-gradient(circle at 50% 50%, #7c3aed, transparent)" }} />
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Your music deserves to be heard,<br/>
            <span className="gradient-text">not buried in forms.</span>
          </h2>
          <p className="mb-8 text-lg" style={{ color: "var(--muted)" }}>
            Join thousands of artists already using DropTrack.
          </p>
          <Link href="/upload"
                className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-lg text-white transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #7c3aed, #5b21b6)" }}>
            Upload your first track — it&apos;s free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-12 text-center text-sm"
              style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-6 h-6 rounded flex items-center justify-center"
               style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }}>
            <span className="text-white text-xs font-bold">D</span>
          </div>
          <span className="font-bold text-white">DropTrack</span>
        </div>
        <p>© 2026 DropTrack · Built for artists, not labels.</p>
      </footer>
    </div>
  );
}
