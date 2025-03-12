import jwt from "jsonwebtoken";
import { User, Role } from "../acm/permission.ts";

const SECRET_KEY = "your-secret-key";

export function generateToken(user: User): String {
  return jwt.sign({ email: user.email, username: user.username, role: user.role }, SECRET_KEY, {
    expiresIn: "1h",
  });
}

export function verifyToken(token: string): { id: string; role: Role } {
  return jwt.verify(token, SECRET_KEY) as { id: string; role: Role };
}

export function genereateGuestToken(): string {
  const payload = {
    id: `guest_${Math.random().toString(36).substring(7)}`,
    role: `guest`,
  };
  return jwt.sign(payload, SECRET_KEY, {expiresIn: '1h'});
}