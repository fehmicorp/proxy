import { handleGet } from "./get";
import { handlePost } from "./post";

export class Proxy {
  static async post(req: any, res: any, redis: (key: string) => Promise<any>) {
    return handlePost(req, res, redis);
  }
  static async get(req: any, res: any, jwt: any, redis: (key: string) => Promise<any>) {
    return handleGet(req, res, jwt, redis);
  }
}