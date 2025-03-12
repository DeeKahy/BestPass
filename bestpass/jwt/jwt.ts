import jwt from "jsonwebtoken";
import { User, Role } from "../acm/permission.ts";

const SECRET_KEY = "your-secret-key";

function generateToken(user: User): String {
  return jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, {
    expiresIn: "1h",
  });
}

function verifyToken(token: string): { id: string; role: Role } {
  return jwt.verify(token, SECRET_KEY) as { id: string; role: Role };
}
