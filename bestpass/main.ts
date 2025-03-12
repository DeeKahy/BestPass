import { generateToken, genereateGuestToken } from "./jwt/jwt.ts";
import { Http } from "./wrapper.ts";
import { User } from "./acm/permission.ts";
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
  .addRoute("GET", "/api/username", async (_req, _user) => {
    return await new Response("<span>Hello, World!</span>", {
      headers: { "content-type": "text/html" },
    });
  }, true)
  .addRoute("GET", "/api/logins", async (_req, _user) => {
    try {
      // Query all passwords from the database
      const logins = server.db.query("SELECT * FROM passwords");

      // Create the complete HTML structure
      let html = `
      <ul class="list bg-base-100 rounded-box shadow-md">
        <li class="p-4 pb-2 text-xs opacity-60 tracking-wide">Logins</li>
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

        const headers = new Headers({
          'Set-Cookie': `jwt=${token}; HttpOnly; Secure; Path=/`,
          'Location': '/',
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
  .serve();
