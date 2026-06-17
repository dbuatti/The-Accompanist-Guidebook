const NEON_AUTH_BASE_URL = process.env.NEON_AUTH_BASE_URL || 'NOT_SET';

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const path = (await params).path.join("/");
  const upstreamUrl = `${NEON_AUTH_BASE_URL}/${path}`;
  const origUrl = new URL(request.url);

  const headers = new Headers();
  headers.set("Origin", origUrl.origin);
  headers.set("x-neon-auth-middleware", "true");

  const upstream = await fetch(upstreamUrl + origUrl.search, {
    method: request.method,
    headers,
  });

  const upstreamBody = await upstream.text();

  return Response.json({
    debug: {
      baseUrl: NEON_AUTH_BASE_URL,
      path,
      upstreamUrl: upstreamUrl + origUrl.search,
      upstreamStatus: upstream.status,
      upstreamHeaders: Object.fromEntries(upstream.headers.entries()),
    },
    upstreamBody: upstreamBody,
  });
}

export const POST = GET;
