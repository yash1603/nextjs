import { prisma } from "@/lib/prisma";
import { comparePassword } from "@/lib/password";
import { generateToken } from "@/lib/jwt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const user = await prisma.user.findUnique({
    where: { username: body.username },
  });

  if (!user)
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );

  const valid = await comparePassword(body.password, user.password);

  if (!valid)
    return NextResponse.json(
      { error: "Invalid password" },
      { status: 401 }
    );

  const token = generateToken(user);

  return NextResponse.json({ token });
}
