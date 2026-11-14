// Look up a YouTube video's length so lesson durations don't have to be typed.
// Uses the YouTube Data API when YOUTUBE_API_KEY is set; otherwise reads the
// public watch page (works for public and unlisted videos, not private ones).

export function youtubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const m =
    url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/) ??
    url.match(/^([A-Za-z0-9_-]{11})$/);
  return m ? m[1] : null;
}

function isoToSeconds(iso: string): number | null {
  const m = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return null;
  return Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0);
}

export async function fetchYoutubeSeconds(id: string): Promise<number | null> {
  const key = process.env.YOUTUBE_API_KEY;
  try {
    if (key) {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${id}&key=${key}`,
        { cache: "no-store" },
      );
      if (res.ok) {
        const data = (await res.json()) as { items?: { contentDetails?: { duration?: string } }[] };
        const iso = data.items?.[0]?.contentDetails?.duration;
        const s = iso ? isoToSeconds(iso) : null;
        if (s) return s;
      }
    }
    const res = await fetch(`https://www.youtube.com/watch?v=${id}&hl=en`, {
      cache: "no-store",
      headers: { "accept-language": "en-AU,en;q=0.9", "user-agent": "Mozilla/5.0" },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const m = html.match(/"lengthSeconds":"(\d+)"/) ?? html.match(/itemprop="duration" content="(PT[^"]+)"/);
    if (!m) return null;
    const s = m[1].startsWith("PT") ? isoToSeconds(m[1]) : Number(m[1]);
    return s && s > 0 ? s : null;
  } catch {
    return null;
  }
}

export function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export async function youtubeDurationFor(url: string | null | undefined): Promise<string | null> {
  const id = youtubeId(url);
  if (!id) return null;
  const s = await fetchYoutubeSeconds(id);
  return s ? formatDuration(s) : null;
}
