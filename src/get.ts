import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { readAuthCookie } from "./cookie";

export async function handleGet(
  req: NextRequest,
  res: typeof NextResponse,
  redis: (key: string) => Promise<any>
) {
  let token = readAuthCookie(req, { name: "accounts_token" });
  
  if (!token) {
    const auth = req.headers.get("authorization");
    if (!auth?.startsWith("Bearer ")) {
      return res.json({ success: false }, { status: 401 });
    }
    token = auth.slice(7);
  }

  const redisRes = await redis(`jwtToken:auth:${token}`);
  if (!redisRes?.data?.secret) {
    return res.json({ success: false }, { status: 401 });
  }
  const jwt = await import("jsonwebtoken");
  jwt.verify(token, redisRes.data.secret);

  const headers = new Headers(req.headers);
  headers.set("x-jwt-secret", redisRes.data.secret);

  return res.next({ request: { headers } });
}