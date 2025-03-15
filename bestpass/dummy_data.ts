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

      CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_email VARCHAR NOT NULL,
        alias VARCHAR NOT NULL,
        review VARCHAR NOT NULL,
        rating INTEGER NOT NULL,
        FOREIGN KEY (user_email) REFERENCES users(email)
      );
    `);

  const user1 = {
    email: "john.doe@example.com",
    username: "JohnDoe",
    master_password: "johnMasterPass",
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

  // Check if there are already 3 or more reviews in the database
  const reviewCount = db.query("SELECT COUNT(*) as count FROM reviews")[0][0] as number;

  if (reviewCount < 3) {
    // Insert reviews only if there are fewer than 3 reviews
    const review1 = {
      user_email: "john.doe@example.com",
      alias: "JDoe",
      review: "Great service!",
      rating: 5,
    };
    const review2 = {
      user_email: "jane.smith@example.com",
      alias: "JSmith",
      review: "Could be better.",
      rating: 3,
    };
    const review3 = {
      user_email: "john.doe@example.com",
      alias: "JDoe",
      review: "Very satisfied with the product.",
      rating: 4,
    };

    db.query(
      "INSERT OR IGNORE INTO reviews (user_email, alias, review, rating) VALUES (?, ?, ?, ?)",
      [
        review1.user_email,
        review1.alias,
        review1.review,
        review1.rating,
      ],
    );

    db.query(
      "INSERT OR IGNORE INTO reviews (user_email, alias, review, rating) VALUES (?, ?, ?, ?)",
      [
        review2.user_email,
        review2.alias,
        review2.review,
        review2.rating,
      ],
    );

    db.query(
      "INSERT OR IGNORE INTO reviews (user_email, alias, review, rating) VALUES (?, ?, ?, ?)",
      [
        review3.user_email,
        review3.alias,
        review3.review,
        review3.rating,
      ],
    );

    console.log("Reviews inserted successfully.");
  } else {
    console.log("Skipping review insertion: Already 3 or more reviews in the database.");
  }

  console.log("Data inserted successfully.");
} catch (error) {
  console.error("Error inserting data:", error);
} finally {
  // Close the database connection
  db.close();
}
