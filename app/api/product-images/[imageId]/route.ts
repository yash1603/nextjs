import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/authMiddleware";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ imageId: string }> }
) {
  const resolvedParams = await params;

  try {

    const user: any = getUserFromRequest(req);

    if (user.role !== "ROLE_ADMIN")
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );

    const image = await prisma.productImage.findUnique({
      where: { id: Number(resolvedParams.imageId) }
    });

    if (!image)
      return NextResponse.json(
        { error: "Image not found" },
        { status: 404 }
      );

    await cloudinary.uploader.destroy(image.publicId);

    await prisma.productImage.delete({
      where: { id: image.id }
    });

    return NextResponse.json({
      message: "Image deleted successfully"
    });

  } catch {

    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    );
  }
}