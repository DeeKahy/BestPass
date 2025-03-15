import { generateRefreshToken, generateToken } from "../../jwt/jwt.ts";
import { getUserByEmail } from "../../db/db_user.ts";
import { Role } from "../../acm/permission.ts";
import { Http } from "../wrapper.ts";

/*
export async function exampleRouteFunction(
  req: Request,
  user: {
    email: string;
    username: string;
    role: Role;
  } | undefined,
): Promise<Response> {
}
 */

export async function postSaveNewPassword(
  req: Request,
  user: {
    email: string;
    username: string;
    role: Role;
  } | undefined,
): Promise<Response> {
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
    const userExists = Http.db.query(
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
    Http.db.query(
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
}

export async function postLogin(req: Request): Promise<Response> {
  const body = await req.formData();
  const email = body.get("email");
  const password = body.get("password");

  // Ensure that email and password are strings
  if (typeof email !== "string" || typeof password !== "string") {
    return new Response("Invalid email or password format", { status: 400 });
  }

  const user = await getUserByEmail(Http.db, email);

  if (user !== null) {
    if (password == user.master_password) {
      console.log("password correct");
      const token = generateToken({
        email: user.email,
        username: user.username,
        role: user.role,
      });

      const refreshToken = generateRefreshToken({
        email: user.email,
        username: user.username,
        role: user.role,
      });

      const redirectUrl = new URL(req.url).searchParams.get("redirect") ||
        "/passwords";

        const headers = new Headers({
          "Location": redirectUrl,
        });
  
        headers.append("Set-Cookie", `jwt=${token}; HttpOnly; Secure; Path=/`);
        headers.append("Set-Cookie", `refreshToken=${refreshToken}; HttpOnly; Secure; Path=/`);

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
}

export async function postLogout(
  _req: Request,
  _user: {
    email: string;
    username: string;
    role: Role;
  } | undefined,
): Promise<Response> {
  // Clear the JWT cookie by setting it to an empty value and making it expire
  const headers = new Headers({
    "Set-Cookie": [
      "jwt=; HttpOnly; Secure; Path=/; Max-Age=0;",
      "refreshToken=; HttpOnly; Secure; Path=/; Max-Age=0;",
    ].join(", "),
    "Location": "/", // Redirect to login page
  });

  return new Response(null, {
    status: 302, // 302 redirect
    headers,
  });
}
