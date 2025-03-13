import { generateToken, genereateGuestToken } from "./jwt/jwt.ts";
import { Http } from "./wrapper.ts";
import { getUserByEmail } from "./db/db_user.ts";

const server = new Http("./bestpass/public");

server
  .addRoute("GET", "/", async (req, _user) => {
    const cookies = server.parseCookie(req);
    const token = cookies.jwt;

    if (!token) {
      const guestToken = genereateGuestToken();
      const headers = new Headers({
        "Set-Cookie": `jwt=${guestToken}; HttpOnly; Secure; Path=/`,
      });

      const response = await server.serveStaticFile(
        req,
        "./bestpass/public/index.html",
      );
      for (const [key, value] of headers.entries()) {
        response.headers.set(key, value);
      }
      return response;
    }

    // If token exists it just serves the static file like normal
    return await server.serveStaticFile(req, "./bestpass/public/index.html");
  }, true)
  .addRoute("GET", "/login", async (req) => {
    return await server.serveStaticFile(req, "./bestpass/public/login.html")
  })
  .addRoute("GET", "/api/username", async (_req, _user) => {
    return await new Response("<span>Hello, World!</span>", {
      headers: { "content-type": "text/html" },
    });
  }, true)
  .addRoute("GET", "/", async (req) => {
    return await server.serveStaticFile(req, "./bestpass/public/index.html")
  })
  .addRoute("GET", "/api/data", async (_req) => {
    return await new Response(JSON.stringify({ message: "Hello, World!"}), {
      headers: { "content-type": "application/json"},
    });
  })
  .addRoute("GET", "/api/username", async (_req) => {
    return await new Response("<span>Hello, World!</span>", {
      headers: { "content-type": "text/html"},
    });
  })
  .addRoute("POST", "/api/savenewpassword", async (req, user) =>  {
    
    try {
      // Get form data from the request
      const formData = await req.formData();
  
      // Extract password data from the form
      const user_email = user?.email as string;
      const website = formData.get("website") as string | null;
      const username = formData.get("username") as string | null;
      const password = formData.get("password") as string;
  
      // Validate required fields
      if (!user_email || !password) {
        return new Response(`
          <div class="alert alert-error">
            <span>User email and password are required</span>
          </div>
        `, {
          headers: { "content-type": "text/html" }
        });
      }
  
      // Check if user exists
      const userExists = server.db.query(
        "SELECT email FROM users WHERE email = ?", 
        [user_email]
      ).length > 0;
  
      if (!userExists) {
        return new Response(`
          <div class="alert alert-error">
            <span>User does not exist</span>
          </div>
        `, {
          headers: { "content-type": "text/html" }
        });
      }
  
      // Insert the new password into the database
      server.db.query(
        "INSERT INTO passwords (user_email, website, username, password) VALUES (?, ?, ?, ?)",
        [user_email, website || null, username || null, password]
      );
  
      // Return success response
      return new Response(`
        <div class="alert alert-success">
          <span>Password saved successfully</span>
        </div>
      `, {
        headers: { "content-type": "text/html" }
      });
    } catch (error) {
      console.error("Error saving password:", error);
  
      // Return error response
      return new Response(`
        <div class="alert alert-error">
          <span>Failed to save password</span>
        </div>
      `, {
        headers: { "content-type": "text/html" }
      });
    }
  }, true)
  .addRoute("GET", "/api/logins", async (_req, user) => {
    try {
      // Query all passwords from the database
      const logins = server.db.query("SELECT * FROM passwords where passwords.user_email=?", [user?.email]);

      // Create the complete HTML structure
      let html = `
      <ul class="list bg-base-100 rounded-box shadow-md">
      `;

      // Add each login as a list item
      for (const login of logins) {
        const website = login[2] || "No website";
        const username = login[3] || "No username";

        html += `
        <li class="list-row align-right">
          <div>
            <div>${website}</div>
            <div class="text-xs opacity-60">${username}</div>
          </div>
          <button class="btn btn-square btn-ghost">
            <svg class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor"><path d="M6 3L20 12 6 21 6 3z"></path></g></svg>
          </button>
          <button class="btn btn-square btn-ghost">
            <svg class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></g></svg>
          </button>
        
        </li>
        `;
      }

      // Close the list
      html += `</ul>`;

      return await new Response(html, {
        headers: { "content-type": "text/html" },
      });
    } catch (error) {
      console.error("Error fetching logins:", error);
      return await new Response("<div>Error loading logins</div>", {
        headers: { "content-type": "text/html" },
        status: 500,
      });
    }
  }, true)
  .addRoute("POST", "/login", async (req, _user) => {
    const body = await req.formData();
    const email = body.get("email");
    const password = body.get("password");

    // Ensure that email and password are strings
    if (typeof email !== "string" || typeof password !== "string") {
      return new Response("Invalid email or password format", { status: 400 });
    }

    const user = await getUserByEmail(server.db, email);

    if (user !== null) {
      if (password == user.master_password) {
        console.log("password correct");
        const token = generateToken(user);
        const redirectUrl = new URL(req.url).searchParams.get("redirect") || "/";

        const headers = new Headers({
          'Set-Cookie': `jwt=${token}; HttpOnly; Secure; Path=/`,
          'Location': redirectUrl,
        });

        return new Response(null, {
          status: 302, // 302 redirect
          headers,
        });
      } else {
        console.log("password wrong");
        return new Response("Invalid credentials", { status: 401 });
      }
    } else {
      console.log("cant find email :(");
      return new Response("User not found", { status: 404 });
    }
  })
  .addRoute("POST", "/api/logout", async (req, _user) => {
    // Clear the JWT cookie by setting it to an empty value and making it expire
    const headers = new Headers({
      'Set-Cookie': 'jwt=; HttpOnly; Secure; Path=/; Max-Age=0',
      'Location': '/login', // Redirect to login page
    });

    return new Response(null, {
      status: 302, // 302 redirect
      headers,
    });
  }, true)
  .serve();
