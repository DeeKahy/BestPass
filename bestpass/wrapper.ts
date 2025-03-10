import { serveFile } from "https://deno.land/std@0.192.0/http/file_server.ts";

class Http {
  handlers: Record<HttpMethods, Record<string, (req: Request) => void>>;

  constructor() {
    this.handlers = {
      GET: {},
      POST: {},
      PUT: {},
      DELETE: {},
    };
  }

  addRoute(method: HttpMethods, path: string, handler: (req: Request) => void): Http {
    this.handlers[method][path] = handler;
    return this;
  }

  stringToMethod(method: string): HttpMethods {
    let httpMethod: HttpMethods;

    switch (method.toLowerCase()) {
      case "get":
        httpMethod = 'GET';
        break;
      case "put":
        httpMethod = 'PUT';
        break;
      case "post":
        httpMethod = 'POST';
        break;
      case "delete":
        httpMethod = 'DELETE';
        break;
    }

    return httpMethod;
  }

  serve() {
    Deno.serve(async (req) => {
      try {
        const url = new URL(req.url);
        let filePath = "./bestpass/public" + decodeURIComponent(url.pathname);

        const method = 

        this.handlers[method][url.pathname](req);

        // Serve index.html for the root path
        if (url.pathname === "/") {
          filePath = "./bestpass/public/index.html";
        }

        console.log("Serving file:", filePath);

        const response = await serveFile(req, filePath);
        console.log("File served successfully:", filePath);
        return response;
      } catch (error) {
        console.error("Error serving file:", error);
        return new Response("404 Not Found", { status: 404 });
      }
    });
  }
}


type HttpMethods = 'GET' | 'POST' | 'PUT' | 'DELETE';
