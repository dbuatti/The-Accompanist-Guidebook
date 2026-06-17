export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const path = (await params).path.join("/");
  return Response.json({ method: "GET", path, url: request.url, ok: true });
}

export async function POST(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const path = (await params).path.join("/");
  return Response.json({ method: "POST", path, url: request.url, ok: true });
}
