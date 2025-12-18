import { NextResponse } from "next/server";
import { handleGet } from "./get";
import { handlePost } from "./post";
import { createRedisAccessor } from "./redis";
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

    return NextResponse.next();
  }
}
