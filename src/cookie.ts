export function setAuthCookie(
  res: any,
  token: string,
  cookieCfg: any
) {
  if (!cookieCfg || !cookieCfg.name) return;
  const isProd = process.env.NODE_ENV === "production";
  res.cookies.set(cookieCfg.name, token, {
    httpOnly: cookieCfg.httpOnly ?? true,
    secure: isProd ? (cookieCfg.secure ?? true) : true,
    sameSite: isProd ? cookieCfg.sameSite ?? "strict" : "none",
    path: cookieCfg.path ?? "/",
  });
}

/**
 * Read auth cookie
 */
export function readAuthCookie(
  req: any,
  cookieCfg: any
): string | null {
  if (!cookieCfg?.name) return null;
  const cookie = req.cookies.get(cookieCfg.name);
  return cookie?.value || null;
}