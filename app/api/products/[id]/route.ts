import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/authMiddleware";


// ================= GET PRODUCT BY ID =================
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;

  const product = await prisma.product.findUnique({
    where: { id: Number(resolvedParams.id) },
    include: {
      category: true,
      specifications: true,
      images: true
    }
  });

  if (!product)
    return NextResponse.json(
      { error: "Product not found" },
      { status: 404 }
    );

  return NextResponse.json(product);
}


// ================= UPDATE PRODUCT =================
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

    const productId = Number(resolvedParams.id);

    const existing = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!existing)
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );

    // delete old specifications
    await prisma.productSpecification.deleteMany({
      where: { productId }
    });

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        name: body.name,
        description: body.description,
        active: body.active,
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
    console.error("PUT /api/products error:", error);
    return NextResponse.json(
      { error: "Internal Server Error or Unauthorized" },
      { status: 500 }
    );
  }
}


// ================= DELETE PRODUCT =================
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

    const productId = Number(resolvedParams.id);

    // Manually cascade delete dependent records to avoid Foreign Key constraint violations
    await prisma.productImage.deleteMany({
      where: { productId }
    });

    await prisma.productSpecification.deleteMany({
      where: { productId }
    });

    await prisma.product.delete({
      where: { id: productId }
    });

    return NextResponse.json({
      message: "Product deleted successfully"
    });

  } catch (error) {
    console.error("DELETE /api/products error:", error);
    return NextResponse.json(
      { error: "Internal Server Error or Unauthorized" },
      { status: 500 }
    );
  }
}