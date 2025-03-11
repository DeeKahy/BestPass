import { Http } from "./wrapper.ts";

const server = new Http("./bestpass/public");

server
  .addRoute("GET", "/", async (req) => {
    return await server.serveStaticFile(req, "./bestpass/public/index.html")
  })
  .addRoute("GET", "/api/data", async (_req) => {
    return await new Response(JSON.stringify({ message: "Hello, World!"}), {
      headers: { "content-type": "application/json"},
    });
  })
  .serve();

