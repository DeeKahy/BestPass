import { serveFile } from "https://deno.land/std@0.192.0/http/file_server.ts";

Deno.serve(async (req) => {
  console.log("Incoming request:", req.method, req.url);

  try {
    const url = new URL(req.url);
    let filePath = "./bestpass/public" + decodeURIComponent(url.pathname);

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
