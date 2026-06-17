const NEON_AUTH_BASE_URL = process.env.NEON_AUTH_BASE_URL || 'https://dummy.neonauth.us-east-1.aws.neon.tech/neondb/auth';

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const path = (await params).path.join("/");
    const upstreamUrl = `${NEON_AUTH_BASE_URL}/${path}`;
    const origUrl = new URL(request.url);

    const headers = new Headers();
    headers.set("Origin", origUrl.origin);
    headers.set("x-neon-auth-middleware", "true");

    const body = request.method === "GET" || request.method === "HEAD" ? undefined : await request.text();

    const upstream = await fetch(upstreamUrl + origUrl.search, {
      method: request.method,
      headers,
      body,
    });

    const upstreamBody = await upstream.text();
    const responseHeaders: Record<string, string> = {};
    upstream.headers.forEach((v, k) => { responseHeaders[k] = v; });

    return new Response(upstreamBody, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Auth GET error:", error);
    return Response.json({
      error: "Auth handler failed",
      details: String(error),
      baseUrl: NEON_AUTH_BASE_URL,
    }, { status: 500 });
  }
}

export const POST = GET;
