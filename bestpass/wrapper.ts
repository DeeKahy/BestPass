import { serveFile } from "https://deno.land/std@0.192.0/http/file_server.ts";
import { DB } from "https://deno.land/x/sqlite@v3.9.0/mod.ts";
import { verifyToken } from "./jwt/jwt.ts";
import { Role, User } from "./acm/permission.ts";

export class Http {
  handlers: Record<
    HttpMethods,
    Record<string, (req: Request) => Promise<Response>>
  >;
  staticDir: string;
  db: DB;

  constructor(staicDir: string) {
    this.handlers = {
      GET: {},
      POST: {},
      PUT: {},
      DELETE: {},
    };
    this.staticDir = staicDir;
    this.db = new DB("password_manager.db");
  }

  addRoute(
    method: HttpMethods,
    path: string,
    handler: (
      req: Request,
      user?: { email: string; username: string; role: Role },
    ) => Promise<Response>,
    requireAuth: boolean = true,
  ): Http {
    this.handlers[method][path] = async (req: Request) => {
      if (requireAuth) {
        const { user, response } = await this.authMiddleware(req);
        if (!user) {
          return response || new Response("authorized", { status: 401 });
        }
        return handler(req, user);
      }
      return handler(req);
    };
    return this;
  }

  async serveStaticFile(req: Request, filePath: string): Promise<Response> {
    try {
      const response = await serveFile(req, filePath);
      console.log("File served successfully:", filePath);
      return response;
    } catch (error) {
      console.error("Error serving file.", error);
      return new Response("404 Not Found", { status: 404 });
    }
  }

  parseCookie(req: Request): Record<string, string> {
    const cookies: Record<string, string> = {};
    const cookieHeader = req.headers.get("Cookie");
    if (cookieHeader) {
      cookieHeader.split(":").forEach((cookie) => {
        const [name, value] = cookie.trim().split("=");
        cookies[name] = value;
      });
    }

    return cookies;
  }

  async authMiddleware(
    req: Request,
  ): Promise<{ user: { email: string; username: string; role: Role } | null; response?: Response }> {
    const cookies = this.parseCookie(req);
    const token = cookies.jwt;
    const url = new URL(req.url)

    if (token) {
      try {
        const payload = verifyToken(token);
        return { user: payload };
      } catch (error) {
        console.error("Invalid token:", error);
        const redirectUrl = `${url.origin}/login?redirect=${encodeURIComponent(url.pathname)}`;
        return { user: null, response: Response.redirect(redirectUrl, 302) };
      }
    }

    const redirectUrl = `${url.origin}/login?redirect=${encodeURIComponent(url.pathname)}`;
    return { user: null, response: Response.redirect(redirectUrl, 302) };
  }

  serve() {
    Deno.serve(async (req) => {
      const url = new URL(req.url);
      const method = req.method as HttpMethods;

      const handler = this.handlers[method][url.pathname];
      if (handler) {
        return handler(req);
      }

      const filePath = `${this.staticDir}${decodeURIComponent(url.pathname)}`;
      try {
        const fileInfo = await Deno.stat(filePath);
        if (fileInfo.isFile) {
          return await this.serveStaticFile(req, filePath);
        }
      } catch (error) {
        console.error("Error serving file:", error);
      }

      return new Response("404 Not Found", { status: 404 });
    });
  }
}

type HttpMethods = "GET" | "POST" | "PUT" | "DELETE";
