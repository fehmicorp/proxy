import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function handlePost(
  req: NextRequest,
  res: typeof NextResponse,
  redis: (key: string) => Promise<any>
) {
  const xKey = req.headers.get("x-key");
  if (!xKey) {
    return res.json(
      { success: false, error: "Missing x-key" },
      { status: 400 }
    );
  }
  const params = Array.from(req.nextUrl.searchParams.entries());
  let selectedParam: { key: string; value: string } | null = null;
  const fnKey = req.nextUrl.searchParams.get("fnKey");
  // const fnKey = params.find(([k]) => k === "fnKey");
  if (selectedParam === null && params.length > 0) {
    const [k, v] = params[0];
    selectedParam = { key: k, value: v };
  }
  const redisKey = 
    selectedParam && fnKey ? `${selectedParam.key}:${selectedParam.value}:${xKey}:${fnKey}` :
    selectedParam ? `${selectedParam.key}:${selectedParam.value}:${xKey}` :
    fnKey ? `${xKey}:${fnKey}:` :
    `${xKey}`;
  const redisRes = await redis(redisKey);
  if (!redisRes.success) {
    return res.json(
      {
        success: false,
        error: "Missing redis mapped data",
      },
      { status: 401 }
    );
  }
  console.log("Redis Response:", redisRes);
  const headers = new Headers(req.headers);
  headers.delete("x-key");
  headers.set("x-auth-key", xKey);
  headers.set("x-auth-data", JSON.stringify(redisRes.data));

  if (selectedParam) {
    headers.set(
      `x-${selectedParam.key.toLowerCase()}-key`,
      selectedParam.value
    );
  }
  return res.next({ request: { headers } });
}