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
  .addRoute("GET", "/api/username", async (_req) => {
    return await new Response("<span>Hello, World!</span>", {
      headers: { "content-type": "text/html"},
    });
  })
  .addRoute("POST", "/api/savenewpassword", async (req) => {
    try {
      // Get form data from the request
      const formData = await req.formData();
  
      // Extract password data from the form
      const user_email = formData.get("user_email");
      const website = formData.get("website");
      const username = formData.get("username");
      const password = formData.get("password");
  
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
  })
  .addRoute("GET", "/api/logins", async (_req) => {
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
        const website = login[2] || 'No website';
        const username = login[3] || 'No username';
  
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
        headers: { "content-type": "text/html"},
      });
    } catch (error) {
      console.error("Error fetching logins:", error);
      return await new Response("<div>Error loading logins</div>", {
        headers: { "content-type": "text/html"},
        status: 500
      });
    }
  })

  .addRoute("POST", "/login", async (req) => {
    const body = await req.formData(); 
    console.log(body);
    const email = body.get("email");
    const password = body.get("password");
  
   const result = await  'SELECT * from users where users.email=?'
    

    return new Response("200");

  })
  .serve();

