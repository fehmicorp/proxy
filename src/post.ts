export async function handlePost(
  req: any,
  res: any,
  redis: (key: string) => Promise<any>
) {
  const xKey = req.headers.get("x-key");
  const fnKey = req.nextUrl.searchParams.get("fnKey") || undefined;
  const fcApi = req.nextUrl.searchParams.get("fcApi") || undefined;
  const redisKey = fcApi ? `fcApi:${fcApi}` : fnKey ? `${xKey}:${fnKey}` : `${xKey}`;
  const headers = new Headers(req.headers);

  // ----------------------------------------------------
  // 1️⃣ fcApi MODE (special rule, no x-key or fnKey needed)
  // ----------------------------------------------------
  if (fcApi) {
    const redisRes = await redis(redisKey);
    if (!redisRes.success) {
      return res.json(redisRes, { status: 401 });
    }

    headers.set("x-auth-data", JSON.stringify(redisRes));
    headers.set("x-auth-key", fcApi);

    return res.next({
      request: { headers },
    });
  }

  // ----------------------------------------------------
  // 2️⃣ STANDARD MODE (x-key + fnKey required)
  // ----------------------------------------------------

  if (!xKey) {
    return res.json(
      { success: false, error: "Missing x-key" },
      { status: 400 }
    );
  }

  if (!fnKey) {
    return res.json(
      { success: false, error: "Missing fnKey" },
      { status: 400 }
    );
  }

  const redisRes = await redis(`${xKey}:${fnKey}`);

  if (!redisRes.success) {
    return res.json(redisRes, { status: 401 });
  }
  const fullData = redisRes.fnData;
  const allowedKeys = ["db", "fn", "graphql", "vector"];
  const matchedKey = allowedKeys.find((key) => fullData[key]);

  if (!matchedKey) {
    return res.json(
      { success: false, error: "No valid operation key found in Redis" },
      { status: 400 }
    );
  }

  const filteredData = fullData[matchedKey];

  headers.set("x-auth-data", JSON.stringify(filteredData));
  headers.set("x-auth-key", xKey);
  headers.set("x-auth-fnkey", fnKey);

  return res.next({
    request: { headers },
  });
}