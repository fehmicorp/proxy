import { NextResponse } from "next/server";
import { handleGet } from "./get";
import { handlePost } from "./post";
import { createRedisAccessor } from "./redis";
import { handleWS } from "./ws";
type NextLikeRequest = {
  method: string;
  headers: Headers;
  nextUrl: URL;
};
export class Proxy {
  static async handle(
    req: NextLikeRequest,
    redisUrl: string
  ) {
    const redis = createRedisAccessor(redisUrl);
    const method = req.method.toUpperCase();

    if (method === "POST") {
      return handlePost(req as any, NextResponse, redis);
    }

    if (method === "GET") {
      return handleGet(req as any, NextResponse, redis);
    }

    if (method === "WS") {
      return handleWS(req as any, NextResponse, redis);
    }
    return NextResponse.next();
  }
}
export class CookieConfig{
  static async setCookie(
    req: any,
    res: any,
    token: string,
    cookieCfg: any
  ) {
    const fnKey = req.headers.get("x-fn-key") ? req.headers.get("x-fn-key") : null;
    const authKey = req.headers.get("x-auth-key") ? req.headers.get("x-auth-key") : null;
    const cookieName = fnKey ? `${authKey}:${fnKey}` : authKey ? `${authKey}` : null;
    const { setAuthCookie, readAuthCookie } = await import("./cookie");
    const existingToken = await readAuthCookie(req, { name: cookieName });
    const cookieConfig = {
      ...cookieCfg.cookie,
      name: cookieName,
    };
    if (existingToken) {
      // Cookie already set, update the cookie
      setAuthCookie(res, token, cookieConfig);
    } else {
      // Set new cookie
      setAuthCookie(res, token, cookieConfig);
    }
  }
}