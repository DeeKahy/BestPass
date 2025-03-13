import { DB } from "https://deno.land/x/sqlite@v3.9.0/mod.ts";

// Initialize database connection
const db = new DB("password_manager.db");

// Create tables if they don't exist
try {
  // Create tables if they don't exist
  db.execute(`  
      CREATE TABLE IF NOT EXISTS users (
        email VARCHAR PRIMARY KEY,
        username VARCHAR NOT NULL,
        master_password VARCHAR NOT NULL,
        role VARCHAR NOT NULL 
      );
  
      CREATE TABLE IF NOT EXISTS passwords (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_email VARCHAR NOT NULL,
        website VARCHAR,
        username VARCHAR,
        password VARCHAR NOT NULL,
        FOREIGN KEY (user_email) REFERENCES users(email),
        UNIQUE(user_email, website, username)
      );
    `);

  const user1 = {
    email: "$2a$10$08MriA2NPj9UI4QOBN63/ehDxFLRA3tjmHEPUiBctzG4G9mh8rwBW", // john.doe@example.com using bcrypt salt 10
    username: "U2FsdGVkX1/Tz4B+kZxC73CZiEGjw49dfWQpKc6gjcE=", // JohnDoe using AES with master password johnMasterPass
    master_password: "U2FsdGVkX1+gfXb3oUvQfLb6LhacIqGjW4JCzh9QXms=", // johnMasterPass using AES
    role: "user",
  };
  const user2 = {
    email: "jane.smith@example.com",
    username: "JaneSmith",
    master_password: "janeMasterPass",
    role: "user",
  };

  db.query(
    "INSERT OR IGNORE INTO users (email, username, master_password, role) VALUES (?, ?, ?, ?)",
    [
      user1.email,
      user1.username,
      user1.master_password,
      user1.role,
    ],
  );

  db.query(
    "INSERT OR IGNORE INTO users (email, username, master_password, role) VALUES (?, ?, ?, ?)",
    [
      user2.email,
      user2.username,
      user2.master_password,
      user2.role,
    ],
  );

  // Insert passwords using INSERT OR IGNORE to avoid duplicates
  const password1 = {
    user_email: "john.doe@example.com",
    website: "example1.com",
    username: "user1",
    password: "pass123",
  };
  const password2 = {
    user_email: "john.doe@example.com",
    website: "example1.com",
    username: "user2",
    password: "pass456",
  };
  const password3 = {
    user_email: "jane.smith@example.com",
    website: "testsite.com",
    username: "testUser",
    password: "abcde12345",
  };

  db.query(
    "INSERT OR IGNORE INTO passwords (user_email, website, username, password) VALUES (?, ?, ?, ?)",
    [
      password1.user_email,
      password1.website,
      password1.username,
      password1.password,
    ],
  );

  db.query(
    "INSERT OR IGNORE INTO passwords (user_email, website, username, password) VALUES (?, ?, ?, ?)",
    [
      password2.user_email,
      password2.website,
      password2.username,
      password2.password,
    ],
  );

  db.query(
    "INSERT OR IGNORE INTO passwords (user_email, website, username, password) VALUES (?, ?, ?, ?)",
    [
      password3.user_email,
      password3.website,
      password3.username,
      password3.password,
    ],
  );

  console.log("Data inserted successfully.");
} catch (error) {
  console.error("Error inserting data:", error);
} finally {
  // Close the database connection
  db.close();
}
