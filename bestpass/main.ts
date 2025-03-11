import { Http } from "./wrapper.ts";

const server = new Http("./bestpass/public");

server
  .addRoute("GET", "/api/data", (_req) => {
    return new Response(JSON.stringify({ message: "Hello, World!"}), {
      headers: { "content-type": "application/json"},
    });
  })
  .serve();

