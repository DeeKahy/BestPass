import { DB } from "https://deno.land/x/sqlite@v3.9.0/mod.ts";
import { User, Role } from "../acm/permission.ts";

export async function getUserByEmail(db: DB, email: string): Promise<User | null> {
  const result = await db.query(
    "SELECT email, username, master_password, role FROM users WHERE email = ?",
    [email],
  );

  if (result.length === 0) {
    return null;
  }

  const userTuple = result[0];
  const user: User = {
    email: userTuple[0] as string,
    username: userTuple[1] as string,
    master_password: userTuple[2] as string,
    role: userTuple[3] as Role,
  }

  return user;
}
