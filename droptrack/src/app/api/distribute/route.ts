import { NextRequest, NextResponse } from "next/server";

// In production this would integrate with a distribution aggregator API
// (e.g., DistroKid's partner API, Symphonic, CD Baby wholesale, etc.)
// For now it simulates the distribution pipeline

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { metadata, platforms, releaseDate } = body;

    if (!metadata || !platforms?.length) {
      return NextResponse.json({ error: "metadata and platforms are required" }, { status: 400 });
    }

    // Simulate per-platform submission (each would call real DSP APIs in prod)
    const results = platforms.map((platformId: string) => ({
      platform: platformId,
      status: "queued",
      estimatedLiveAt: releaseDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      submissionId: `DT-${platformId.toUpperCase()}-${Date.now()}`,
    }));

    // Generate a release ID
    const releaseId = `REL-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    return NextResponse.json({
      releaseId,
      status: "submitted",
      message: `Your track "${metadata.title}" has been submitted to ${platforms.length} platforms.`,
      results,
      estimatedLiveAt: releaseDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (err) {
    console.error("[distribute]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Distribution failed" },
      { status: 500 }
    );
  }
}
