import { auth } from '@/lib/auth/server';

const { GET: handlerGet, POST: handlerPost } = auth.handler();

export async function GET(request: Request) {
  try {
    return await handlerGet(request);
  } catch (error) {
    console.error("Auth GET error:", error);
    return new Response(JSON.stringify({ error: "Auth handler failed", details: String(error) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

export async function POST(request: Request) {
  try {
    return await handlerPost(request);
  } catch (error) {
    console.error("Auth POST error:", error);
    return new Response(JSON.stringify({ error: "Auth handler failed", details: String(error) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}