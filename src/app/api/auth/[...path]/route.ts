import { auth } from '@/lib/auth/server';

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { GET: handler } = auth.handler();
    return await handler(request, { params });
  } catch (error) {
    console.error("Auth GET error:", error);
    return Response.json({ error: "Auth GET failed", details: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { POST: handler } = auth.handler();
    return await handler(request, { params });
  } catch (error) {
    console.error("Auth POST error:", error);
    return Response.json({ error: "Auth POST failed", details: String(error) }, { status: 500 });
  }
}