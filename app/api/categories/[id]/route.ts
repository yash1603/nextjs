import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/authMiddleware";


// GET BY ID (PUBLIC)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;

  const category = await prisma.category.findUnique({
    where: { id: Number(resolvedParams.id) }
  });

  if (!category)
    return NextResponse.json(
      { error: "Category not found" },
      { status: 404 }
    );

  return NextResponse.json(category);
}


// UPDATE (ADMIN)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;

  try {

    const user: any = getUserFromRequest(req);

    if (user.role !== "ROLE_ADMIN")
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );

    const body = await req.json();

    const category = await prisma.category.update({
      where: { id: Number(resolvedParams.id) },
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


// DELETE (ADMIN)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;

  try {

    const user: any = getUserFromRequest(req);

    if (user.role !== "ROLE_ADMIN")
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );

    await prisma.category.delete({
      where: { id: Number(resolvedParams.id) }
    });

    return NextResponse.json({
      message: "Category deleted successfully"
    });

  } catch {

    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}