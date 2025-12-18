import { readAuthCookie } from "./cookie";

export async function handleGet(
  req: any,
  res: any,
  jwt: any,
  redis: (key: string) => Promise<any>
) {
  // 1️⃣ Try cookie first
  let token = readAuthCookie(req, { name: "accounts_token" });

  // 2️⃣ Fallback to Authorization header
  if (!token) {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.json(
        { success: false, error: "Missing authentication token" },
        { status: 401 }
      );
    }

    token = authHeader.replace("Bearer ", "").trim();
  }

  // 3️⃣ Final safety check
  if (!token) {
    return res.json(
      { success: false, error: "Missing authentication token" },
      { status: 401 }
    );
  }

  // 🔐 JWT runtime record stored during login
  const redisRes = await redis(`jwtToken:auth:${token}`);

  if (!redisRes.success || !redisRes.data?.secret) {
    return res.json(
      { success: false, error: "Invalid or expired token" },
      { status: 401 }
    );
  }

  // Verify token (defensive)
  try {
    jwt.verify(token, redisRes.data.secret);
  } catch {
    return res.json(
      { success: false, error: "JWT verification failed" },
      { status: 401 }
    );
  }

  const headers = new Headers(req.headers);
  headers.set("x-jwt-secret", redisRes.data.secret);
  headers.set("Authorization", `Bearer ${token}`);

  return res.next({
    request: { headers },
  });
}