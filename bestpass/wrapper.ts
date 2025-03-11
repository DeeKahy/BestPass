import { serveFile } from "https://deno.land/std@0.192.0/http/file_server.ts";

export class Http {
  handlers: Record<HttpMethods, Record<string, (req: Request) => Promise<Response>>>;
  staticDir: string;

  constructor(staicDir: string) {
    this.handlers = {
      GET: {},
      POST: {},
      PUT: {},
      DELETE: {},
    };
    this.staticDir = staicDir;
  }

  addRoute(method: HttpMethods, path: string, handler: (req: Request) => Promise<Response>): Http {
    this.handlers[method][path] = handler;
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
