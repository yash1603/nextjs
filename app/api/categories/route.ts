import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/authMiddleware";


// GET ALL (PUBLIC)
export async function GET() {

  const categories = await prisma.category.findMany({
    orderBy: { id: "asc" }
  });

  return NextResponse.json(categories);
}


// CREATE CATEGORY (ADMIN)
export async function POST(req: Request) {

  try {

    const user: any = getUserFromRequest(req);

    if (user.role !== "ROLE_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const exists = await prisma.category.findUnique({
      where: { name: body.name }
    });

    if (exists) {
      return NextResponse.json(
        { error: "Category already exists" },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name: body.name
      }
    });

    return NextResponse.json(category);

  } catch {

    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}
