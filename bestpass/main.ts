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
  .addRoute("POST", "/login", async (req) => {
    const body = await req.formData(); 
    console.log(body);
    const email = body.get("email");
    const password = body.get("password");
  
   const result = await  'SELECT * from users where users.email=?'
    

    return new Response("200");
  })
  .serve();

