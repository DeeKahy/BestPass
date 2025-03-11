import { serveFile } from "https://deno.land/std@0.192.0/http/file_server.ts";
import { DB } from "https://deno.land/x/sqlite@v3.7.0/mod.ts";

// Initialize database connection
const db = new DB("password_manager.db");

// Create tables if they don't exist
db.execute(`
  CREATE TABLE IF NOT EXISTS users (
    email VARCHAR PRIMARY KEY,
    username VARCHAR NOT NULL,
    master_password VARCHAR NOT NULL
  );

  CREATE TABLE IF NOT EXISTS passwords (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email VARCHAR NOT NULL,
    website VARCHAR,
    username VARCHAR,
    password VARCHAR NOT NULL,
    FOREIGN KEY (user_email) REFERENCES users(email)
  );
`);

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
