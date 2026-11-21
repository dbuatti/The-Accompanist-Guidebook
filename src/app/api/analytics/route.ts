import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { events } = body as { events?: Array<{ name: string; props?: Record<string, unknown>; ts?: number }> };

    if (!events || !Array.isArray(events)) {
      return NextResponse.json({ error: "Expected { events: [...] }" }, { status: 400 });
    }

    // Fire-and-forget: log each event, never block the client.
    for (const ev of events) {
      logger.info("analytics_event", { name: ev.name, props: ev.props, ts: ev.ts });
    }

    return NextResponse.json({ received: events.length });
  } catch (error) {
    logger.error("Analytics ingestion failed:", error);
    // Always 200 so the client never retries or surfaces an error.
    return NextResponse.json({ received: 0 });
  }
}
