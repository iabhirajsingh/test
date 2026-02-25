import { Platform } from "./types";

export const PLATFORMS: Platform[] = [
  { id: "spotify",       name: "Spotify",        logo: "🎵", color: "#1DB954", monthlyUsers: "602M",  tier: "major",     status: "available" },
  { id: "apple_music",   name: "Apple Music",    logo: "🍎", color: "#FC3C44", monthlyUsers: "88M",   tier: "major",     status: "available" },
  { id: "youtube_music", name: "YouTube Music",  logo: "▶️",  color: "#FF0000", monthlyUsers: "100M+", tier: "major",     status: "available" },
  { id: "amazon_music",  name: "Amazon Music",   logo: "📦", color: "#00A8E1", monthlyUsers: "82M",   tier: "major",     status: "available" },
  { id: "tidal",         name: "Tidal",          logo: "🌊", color: "#00FFFF", monthlyUsers: "10M",   tier: "secondary", status: "available" },
  { id: "deezer",        name: "Deezer",         logo: "🎶", color: "#EF5466", monthlyUsers: "16M",   tier: "secondary", status: "available" },
  { id: "pandora",       name: "Pandora",        logo: "📻", color: "#3668FF", monthlyUsers: "48M",   tier: "secondary", status: "available" },
  { id: "soundcloud",    name: "SoundCloud",     logo: "☁️",  color: "#FF5500", monthlyUsers: "40M",   tier: "secondary", status: "available" },
  { id: "qobuz",         name: "Qobuz",          logo: "💎", color: "#2A4D9F", monthlyUsers: "5M",    tier: "niche",     status: "available" },
  { id: "tencent",       name: "Tencent Music",  logo: "🐧", color: "#3AB540", monthlyUsers: "800M",  tier: "major",     status: "available" },
  { id: "joox",          name: "JOOX",           logo: "🎤", color: "#008000", monthlyUsers: "45M",   tier: "niche",     status: "available" },
  { id: "anghami",       name: "Anghami",        logo: "🌙", color: "#5C41FF", monthlyUsers: "70M",   tier: "secondary", status: "available" },
  { id: "boomplay",      name: "Boomplay",       logo: "💥", color: "#FF6B35", monthlyUsers: "75M",   tier: "secondary", status: "available" },
  { id: "kkbox",         name: "KKBOX",          logo: "🎼", color: "#009A44", monthlyUsers: "10M",   tier: "niche",     status: "available" },
  { id: "melon",         name: "Melon",          logo: "🍈", color: "#00CD3C", monthlyUsers: "28M",   tier: "niche",     status: "available" },
  { id: "napster",       name: "Napster",        logo: "😸", color: "#0D67B4", monthlyUsers: "5M",    tier: "niche",     status: "available" },
  { id: "shazam",        name: "Shazam",         logo: "⚡", color: "#0088FF", monthlyUsers: "225M",  tier: "secondary", status: "available" },
  { id: "iheartradio",   name: "iHeartRadio",    logo: "❤️",  color: "#C6002B", monthlyUsers: "129M",  tier: "secondary", status: "available" },
  { id: "netease",       name: "NetEase Cloud",  logo: "☁️",  color: "#E60012", monthlyUsers: "200M",  tier: "major",     status: "available" },
  { id: "audiomack",     name: "Audiomack",      logo: "🎧", color: "#FFA200", monthlyUsers: "20M",   tier: "niche",     status: "available" },
];

export const MAJOR_PLATFORMS = PLATFORMS.filter((p) => p.tier === "major");
export const DEFAULT_SELECTED = ["spotify", "apple_music", "youtube_music", "amazon_music", "tidal", "deezer"];
