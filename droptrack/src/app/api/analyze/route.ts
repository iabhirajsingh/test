import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { generateISRC, generateUPC, generateISWC, guessLanguageFromTitle } from "@/lib/isrc";
import { TrackMetadata } from "@/lib/types";

// Increase serverless function timeout to 60s (requires Vercel Pro/Hobby max)
export const maxDuration = 60;

// Audio metadata tags live in the first few KB — no need to download the whole file
const METADATA_RANGE_BYTES = 512 * 1024; // 512 KB

// We use music-metadata for server-side tag parsing
// Dynamic import since it's ESM
async function parseAudioTags(buffer: Buffer, mimeType: string, fileSize?: number) {
  try {
    const mm = await import("music-metadata");
    const meta = await mm.parseBuffer(buffer, { mimeType, size: fileSize }, { skipCovers: true });
    const { common, format } = meta;
    return {
      title: common.title,
      artist: common.artist,
      album: common.album,
      albumArtist: common.albumartist,
      genre: common.genre?.[0],
      year: common.year,
      trackNumber: common.track?.no,
      totalTracks: common.track?.of,
      discNumber: common.disk?.no,
      label: common.label?.[0],
      bpm: common.bpm,
      key: common.key,
      isrc: common.isrc?.[0],
      language: common.language,
      lyrics: common.lyrics?.[0]?.text,
      duration: format.duration,
      bitrate: format.bitrate,
      sampleRate: format.sampleRate,
      channels: format.numberOfChannels,
      codecName: format.codec,
      lossless: format.lossless,
    };
  } catch {
    return {};
  }
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function aiEnrichMetadata(
  filename: string,
  existingTags: Record<string, unknown>,
  duration: number | undefined,
  hasCover: boolean
): Promise<Partial<TrackMetadata> & { aiConfidence: Record<string, number>; aiGenerated: Record<string, boolean>; suggestions: string[] }> {
  const prompt = `You are an expert music metadata specialist and A&R consultant. Analyze the following audio file information and provide comprehensive, professional metadata for music distribution.

FILE INFORMATION:
- Filename: "${filename}"
- Duration: ${duration ? `${Math.floor(duration / 60)}:${Math.floor(duration % 60).toString().padStart(2, "0")}` : "unknown"}
- Has cover art: ${hasCover}

EXISTING EMBEDDED TAGS (may be empty, partial, or inconsistent):
${JSON.stringify(existingTags, null, 2)}

Based on the filename, existing tags, and your music industry knowledge, provide:

1. Complete, professional metadata filling all gaps
2. A confidence score (0.0-1.0) for each field you fill or verify
3. A flag for each field indicating if it was AI-generated vs. from existing tags
4. 3-5 actionable suggestions for the artist

Return ONLY valid JSON with this exact structure:
{
  "title": "string",
  "artist": "string",
  "featuredArtists": [],
  "album": "string (use track title if single)",
  "albumArtist": "string",
  "genre": "string (specific, e.g. 'Deep House' not just 'Electronic')",
  "subGenre": "string",
  "mood": ["string", "string", "string"],
  "bpm": number_or_null,
  "key": "string (e.g. 'A minor', 'C# major')",
  "energy": "low|medium|high",
  "language": "string (ISO 639-1 code, e.g. 'en')",
  "explicit": false,
  "label": "string (use artist name + ' Music' if independent)",
  "copyright": "string (e.g. '2026 Artist Name')",
  "releaseDate": "YYYY-MM-DD (suggest a near-future date if not set)",
  "releaseYear": number,
  "spotifyPitch": "string (2-3 sentences for Spotify editorial pitch, mention target playlists)",
  "applePitch": "string (2 sentences for Apple Music pitch)",
  "previewStartSeconds": number (best 30-second hook start point in seconds),
  "priceCategory": "standard",
  "territories": "worldwide",
  "aiConfidence": {
    "title": 0.0,
    "artist": 0.0,
    "genre": 0.0,
    "subGenre": 0.0,
    "mood": 0.0,
    "bpm": 0.0,
    "key": 0.0,
    "energy": 0.0,
    "language": 0.0,
    "explicit": 0.0,
    "label": 0.0,
    "copyright": 0.0,
    "releaseDate": 0.0,
    "spotifyPitch": 0.0,
    "applePitch": 0.0,
    "previewStartSeconds": 0.0
  },
  "aiGenerated": {
    "title": true_or_false,
    "artist": true_or_false,
    "genre": true_or_false,
    "subGenre": true_or_false,
    "mood": true_or_false,
    "bpm": true_or_false,
    "key": true_or_false,
    "energy": true_or_false,
    "language": true_or_false,
    "explicit": true_or_false,
    "label": true_or_false,
    "copyright": true_or_false,
    "releaseDate": true_or_false,
    "spotifyPitch": true_or_false,
    "applePitch": true_or_false,
    "previewStartSeconds": true_or_false
  },
  "suggestions": [
    "string",
    "string",
    "string"
  ]
}`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  // Strip markdown code fences if present (e.g. ```json ... ```)
  const stripped = text.replace(/^```(?:json)?\s*/m, "").replace(/\s*```\s*$/m, "").trim();
  const jsonMatch = stripped.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI returned invalid response");

  return JSON.parse(jsonMatch[0]);
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "Server configuration error: ANTHROPIC_API_KEY is not set" }, { status: 500 });
  }

  const t0 = Date.now();
  try {
    let buffer: Buffer;
    let filename: string;
    let fileType: string;
    let hasCover = false;
    let blobUrl: string | null = null;
    let fileSize: number | undefined;

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      // Large file path: receive blob URL, fetch only first 512KB for tag parsing
      const body = await req.json();
      blobUrl = body.blobUrl;
      filename = body.filename;
      fileType = body.fileType || "audio/mpeg";
      hasCover = body.hasCover || false;
      fileSize = body.fileSize as number | undefined;

      if (!blobUrl) {
        return NextResponse.json({ error: "No blobUrl provided" }, { status: 400 });
      }

      // Range-fetch only the first 512KB — audio tags are always at the start of the file
      const response = await fetch(blobUrl, {
        headers: { Range: `bytes=0-${METADATA_RANGE_BYTES - 1}` },
      });
      if (!response.ok && response.status !== 206) {
        return NextResponse.json({ error: "Failed to fetch audio from blob storage" }, { status: 500 });
      }
      const arrayBuffer = await response.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      // Small file path: legacy FormData upload (stays for backwards compat)
      const form = await req.formData();
      const audioFile = form.get("audio") as File | null;
      const coverFile = form.get("cover") as File | null;

      if (!audioFile) {
        return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
      }

      const arrayBuffer = await audioFile.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      filename = audioFile.name;
      fileType = audioFile.type;
      hasCover = !!coverFile;
    }

    // Parse existing embedded tags (pass fileSize so music-metadata can compute duration correctly)
    const tags = await parseAudioTags(buffer, fileType, fileSize);

    // Generate IDs
    const isrc = (tags.isrc as string) || generateISRC();
    const upc = generateUPC();
    const iswc = generateISWC();

    // Guess language from title if not set
    const languageGuess = (tags.title as string)
      ? guessLanguageFromTitle(tags.title as string)
      : "en";

    // Enrich with AI
    const aiResult = await aiEnrichMetadata(
      filename,
      tags,
      tags.duration as number | undefined,
      hasCover
    );

    // Clean up blob after processing
    if (blobUrl) {
      const { del } = await import("@vercel/blob");
      await del(blobUrl).catch(() => {});
    }

    // Merge: existing tags take precedence for hard data, AI fills gaps
    const metadata: Partial<TrackMetadata> = {
      title: (tags.title as string) || aiResult.title || filename.replace(/\.[^.]+$/, ""),
      artist: (tags.artist as string) || aiResult.artist || "Unknown Artist",
      featuredArtists: aiResult.featuredArtists || [],
      album: (tags.album as string) || aiResult.album || aiResult.title || "",
      albumArtist: (tags.albumArtist as string) || aiResult.albumArtist || "",
      genre: (tags.genre as string) || aiResult.genre || "Electronic",
      subGenre: aiResult.subGenre || "",
      mood: aiResult.mood || [],
      bpm: (tags.bpm as number) || aiResult.bpm || null,
      key: (tags.key as string) || aiResult.key || "",
      energy: aiResult.energy || null,
      explicit: aiResult.explicit || false,
      language: (tags.language as string) || aiResult.language || languageGuess,
      lyrics: (tags.lyrics as string) || "",
      label: (tags.label as string) || aiResult.label || "",
      copyright: aiResult.copyright || `2026 ${(tags.artist as string) || aiResult.artist || ""}`,
      releaseDate: aiResult.releaseDate || new Date().toISOString().split("T")[0],
      releaseYear: aiResult.releaseYear || new Date().getFullYear(),
      isrc,
      upc,
      iswc,
      trackNumber: (tags.trackNumber as number) || null,
      totalTracks: (tags.totalTracks as number) || null,
      discNumber: (tags.discNumber as number) || null,
      spotifyPitch: aiResult.spotifyPitch || "",
      applePitch: aiResult.applePitch || "",
      previewStartSeconds: aiResult.previewStartSeconds || 30,
      priceCategory: "standard",
      territories: "worldwide",
      splits: [],
      aiConfidence: aiResult.aiConfidence || {},
      aiGenerated: aiResult.aiGenerated || {},
    };

    const audioInfo = {
      duration: (tags.duration as number) || 0,
      bitrate: (tags.bitrate as number) || 0,
      sampleRate: (tags.sampleRate as number) || 44100,
      channels: (tags.channels as number) || 2,
      format: (tags.codecName as string) || fileType,
      fileSize: fileSize ?? buffer.length,
    };

    return NextResponse.json({
      metadata,
      audioInfo,
      suggestions: aiResult.suggestions || [],
      processingTime: Date.now() - t0,
    });
  } catch (err) {
    console.error("[analyze]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
