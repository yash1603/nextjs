import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/authMiddleware";

// ================= GET ALL PRODUCTS =================
export async function GET() {

  const products = await prisma.product.findMany({
    include: {
      category: true,
      specifications: true,
      images: true
    },
    orderBy: { id: "asc" }
  });

  return NextResponse.json(products);
}


// ================= CREATE PRODUCT =================
export async function POST(req: Request) {

  try {

    const user: any = getUserFromRequest(req);

    if (user.role !== "ROLE_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    const category = await prisma.category.findUnique({
      where: { id: body.categoryId }
    });

    if (!category)
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );

    const product = await prisma.product.create({
      data: {
        name: body.name,
        description: body.description,
        active: body.active ?? true,
        categoryId: body.categoryId,

        specifications: {
          create: body.specifications || []
        }
      },
      include: {
        specifications: true
      }
    });

    return NextResponse.json(product);

  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json(
      { error: "Internal Server Error or Unauthorized" },
      { status: 500 }
    );
  }
}
