import { generateToken, genereateGuestToken } from "./jwt/jwt.ts";
import { Http } from "./wrapper.ts";
import { getUserByEmail } from "./db/db_user.ts";

const server = new Http("./bestpass/public");

server
  .addRoute("GET", "/", async (req) => {
    const cookies = server.parseCookie(req);
    const token = cookies.jwt;

    const { user } = await server.authMiddleware(req);

    console.log(user);

    if (!token) {
      const guestToken = genereateGuestToken();
      const headers = new Headers({
        "Set-Cookie": `jwt=${guestToken}; HttpOnly; Secure; Path=/`,
      });

      const data = {
        user: { isAuthenticated: false, name: user?.username },
      };

      const response = await server.renderTemplate("index.eta", data);
      for (const [key, value] of headers.entries()) {
        response.headers.set(key, value);
      }
      return response;
    }

    const isAuthenticated = user?.role === "user" || user?.role === "admin";
    const data = {
      user: { isAuthenticated: isAuthenticated, name: user?.username, },
    };
    // If token exists it just serves the static file like normal
    return await server.renderTemplate("index.eta", data);
  }, false)
  .addRoute("GET", "/passwords", async (req, user) => {
    try {
      // Query all passwords from the database
      const logins = server.db.query(
        "SELECT * FROM passwords where passwords.user_email=?",
        [user?.email],
      );

      // Ensure logins is an array
      const validLogins = Array.isArray(logins) ? logins : [];

      const transformedData = validLogins.map((item) => ({
        website: item[2],
        username: item[3],
      }));

      console.log("Transformed Data:", transformedData);

      const dataToRender = {
        data: transformedData,
        user: {
          isAuthenticated: user?.role === "user" || user?.role === "admin",
          name: user?.username,
        },
      };

      const response = server.renderTemplate("passwords.eta", dataToRender);
      response.headers.set("content-type", "text/html");

      return response;
    } catch (_error) {
      return server.redirect(new URL(req.url));
    }
  }, true)
  .addRoute("GET", "/login", async (req) => {
    return await server.serveStaticFile(req, "./bestpass/public/login.html");
  })
  .addRoute("GET", "/api/username", async (_req, _user) => {
    return await new Response("<span>Hello, World!</span>", {
      headers: { "content-type": "text/html" },
    });
  }, true)
  .addRoute("GET", "/api/data", async (_req) => {
    return await new Response(JSON.stringify({ message: "Hello, World!" }), {
      headers: { "content-type": "application/json" },
    });
  })
  .addRoute("GET", "/api/username", async (_req) => {
    return await new Response("<span>Hello, World!</span>", {
      headers: { "content-type": "text/html" },
    });
  })
  .addRoute("POST", "/api/savenewpassword", async (req, user) => {
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
        return new Response(
          `
          <div class="alert alert-error">
            <span>User email and password are required</span>
          </div>
        `,
          {
            headers: { "content-type": "text/html" },
          },
        );
      }

      // Check if user exists
      const userExists = server.db.query(
        "SELECT email FROM users WHERE email = ?",
        [user_email],
      ).length > 0;

      if (!userExists) {
        return new Response(
          `
          <div class="alert alert-error">
            <span>User does not exist</span>
          </div>
        `,
          {
            headers: { "content-type": "text/html" },
          },
        );
      }

      // Insert the new password into the database
      server.db.query(
        "INSERT INTO passwords (user_email, website, username, password) VALUES (?, ?, ?, ?)",
        [user_email, website || null, username || null, password],
      );

      // Return success response
      return new Response(
        `
        <div class="alert alert-success">
          <span>Password saved successfully</span>
        </div>
      `,
        {
          headers: { "content-type": "text/html" },
        },
      );
    } catch (error) {
      console.error("Error saving password:", error);

      // Return error response
      return new Response(
        `
        <div class="alert alert-error">
          <span>Failed to save password</span>
        </div>
      `,
        {
          headers: { "content-type": "text/html" },
        },
      );
    }
  }, true)
  .addRoute("GET", "/api/logins", async (_req, user) => { // Route has been made redundant
    try {
      // Query all passwords from the database
      const logins = server.db.query(
        "SELECT * FROM passwords where passwords.user_email=?",
        [user?.email],
      );

      // Ensure logins is an array
      const validLogins = Array.isArray(logins) ? logins : [];

      const transformedData = validLogins.map((item) => ({
        website: item[2],
        username: item[3],
      }));

      console.log("Transformed Data:", transformedData);

      const dataToRender = {
        data: transformedData,
        user: {
          isAuthenticated: user?.role === "user" || user?.role === "admin",
        },
      };

      const response = server.renderTemplate("passwords.eta", dataToRender);
      response.headers.set("content-type", "text/html");

      return response;
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
        const redirectUrl = new URL(req.url).searchParams.get("redirect") ||
          "/passwords";

        const headers = new Headers({
          "Set-Cookie": `jwt=${token}; HttpOnly; Secure; Path=/`,
          "Location": redirectUrl,
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
      "Set-Cookie": "jwt=; HttpOnly; Secure; Path=/; Max-Age=0",
      "Location": "/login", // Redirect to login page
    });

    return new Response(null, {
      status: 302, // 302 redirect
      headers,
    });
  }, true)
  .serve();
