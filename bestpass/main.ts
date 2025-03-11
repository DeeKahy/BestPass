import { serveFile } from "https://deno.land/std@0.192.0/http/file_server.ts";
import { DB } from "https://deno.land/x/sqlite@v3.7.0/mod.ts";
import { Http } from "./wrapper.ts";

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

const server = new Http("./bestpass/public");

server
  .addRoute("GET", "/api/data", (_req) => {
    return new Response(JSON.stringify({ message: "Hello, World!"}), {
      headers: { "content-type": "application/json"},
    });
  })
  .serve();

