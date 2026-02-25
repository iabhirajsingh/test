export interface TrackMetadata {
  // Core
  title: string;
  artist: string;
  featuredArtists: string[];
  album: string;
  albumArtist: string;
  trackNumber: number | null;
  totalTracks: number | null;
  discNumber: number | null;

  // Release
  releaseDate: string;
  releaseYear: number | null;
  label: string;
  copyright: string;

  // Genre & mood
  genre: string;
  subGenre: string;
  mood: string[];
  bpm: number | null;
  key: string;
  energy: "low" | "medium" | "high" | null;
  explicit: boolean;

  // IDs
  isrc: string;
  upc: string;
  iswc: string;

  // Lyrics & language
  language: string;
  lyrics: string;

  // Distribution
  previewStartSeconds: number;
  territories: "worldwide" | string[];
  priceCategory: "standard" | "budget" | "premium";

  // Streaming pitch
  spotifyPitch: string;
  applePitch: string;

  // Splits
  splits: Collaborator[];

  // AI confidence (0-1 per field)
  aiConfidence: Record<string, number>;
  aiGenerated: Record<string, boolean>;
}

export interface Collaborator {
  id: string;
  name: string;
  role: "primary_artist" | "featured_artist" | "producer" | "songwriter" | "mixer" | "mastering";
  split: number; // percentage
  email: string;
}

export interface Platform {
  id: string;
  name: string;
  logo: string;
  color: string;
  monthlyUsers: string;
  tier: "major" | "secondary" | "niche";
  status: "available" | "coming_soon";
}

export interface Release {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  status: "processing" | "reviewing" | "distributing" | "live" | "rejected";
  platforms: string[];
  submittedAt: string;
  liveAt: string | null;
  streams: number;
  revenue: number;
  metadata: Partial<TrackMetadata>;
}

export interface AnalyzeResponse {
  metadata: Partial<TrackMetadata>;
  audioInfo: {
    duration: number;
    bitrate: number;
    sampleRate: number;
    channels: number;
    format: string;
    fileSize: number;
  };
  suggestions: string[];
  processingTime: number;
}
