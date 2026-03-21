import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;

export function generateToken(user: any) {
  return jwt.sign(
    {
      username: user.username,
      role: user.role,
    },
    SECRET,
    { expiresIn: "1h" }
  );
}

export function verifyToken(token: string) {
  return jwt.verify(token, SECRET);
}