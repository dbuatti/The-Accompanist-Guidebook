// Kit.com (ConvertKit) v4 API client for the mailing list.
// Used by the waitlist server action to keep every signup in sync with Kit so
// automations (welcome series, the 48-hour checklist lead magnet, weekly tips)
// can fire automatically. Tags are resolved by name and created on demand.

const KIT_API_URL = "https://api.kit.com/v4";

export function isKitConfigured(): boolean {
  return !!process.env.KIT_API_KEY;
}

function sourceTags(source: string): string[] {
  const tags = ["newsletter"];
  const s = (source || "").trim();

  if (s === "landing") {
    tags.push("landing");
  } else if (s === "guides-hub") {
    tags.push("guides-hub");
  } else if (s.startsWith("guide:")) {
    tags.push("guide");
    const slug = s.slice("guide:".length).trim();
    tags.push(`guide:${slug}`);
    if (slug === "the-48-hour-pre-audition-checklist") {
      tags.push("lead-magnet");
      tags.push("lead-magnet:48hr-checklist");
    }
  }

  return tags;
}

async function kitFetch(path: string, init: RequestInit = {}): Promise<any> {
  const key = process.env.KIT_API_KEY;
  if (!key) throw new Error("KIT_API_KEY is not configured");

  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  headers.set("X-Kit-Api-Key", key);

  const res = await fetch(`${KIT_API_URL}${path}`, { ...init, headers });
  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  if (!res.ok) {
    throw new Error(`Kit API ${path} failed (${res.status}): ${text}`);
  }
  return json;
}

// Kit tags are keyed by numeric id in v4, but we work with human-readable
// names. Cache the id lookup so repeated signups don't re-list tags.
let tagIdCache: Record<string, number> | null = null;

async function resolveTagIds(names: string[]): Promise<Record<string, number>> {
  if (!tagIdCache) {
    const data = await kitFetch("/tags");
    const map: Record<string, number> = {};
    for (const tag of data?.tags ?? []) {
      map[tag.name] = Number(tag.id);
    }
    tagIdCache = map;
  }

  const ids: Record<string, number> = {};
  for (const name of names) {
    let id = tagIdCache[name];
    if (!id) {
      const created = await kitFetch("/tags", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      id = Number(created?.tag?.id);
      if (id) tagIdCache[name] = id;
    }
    if (id) ids[name] = id;
  }
  return ids;
}

export async function subscribeToKit(input: {
  email: string;
  source: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!isKitConfigured()) {
    return { ok: false, error: "KIT_API_KEY is not configured" };
  }

  try {
    const tags = sourceTags(input.source);
    const tagIds = await resolveTagIds(tags);

    // Upsert the subscriber (email_address is the unique key in Kit).
    await kitFetch("/subscribers", {
      method: "POST",
      body: JSON.stringify({
        email_address: input.email,
        fields: { source: input.source },
      }),
    });

    // Tag them once the subscriber exists. Tag-by-email is idempotent.
    for (const id of Object.values(tagIds)) {
      await kitFetch(`/tags/${id}/subscribers`, {
        method: "POST",
        body: JSON.stringify({ email_address: input.email }),
      });
    }

    return { ok: true };
  } catch (error) {
    console.error("Kit sync error:", error);
    return { ok: false, error: "Failed to sync to Kit" };
  }
}