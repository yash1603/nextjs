import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const password = await hashPassword(body.password);

  const user = await prisma.user.create({
    data: {
      username: body.username,
      password: password,
      role: body.role || "ROLE_USER",
    },
  });

  return NextResponse.json(user);
}
