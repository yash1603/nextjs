import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/authMiddleware";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const resolvedParams = await params;

  try {

    const user: any = getUserFromRequest(req);

    if (user.role !== "ROLE_ADMIN")
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );

    const formData = await req.formData();
    const files = formData.getAll("images") as File[];

    const productId = Number(resolvedParams.productId);

    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product)
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );

    const savedImages = [];

    for (const file of files) {

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const result: any = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: `products/product-${productId}`
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(buffer);
      });

      const image = await prisma.productImage.create({
        data: {
          imageUrl: result.secure_url,
          publicId: result.public_id,
          productId
        }
      });

      savedImages.push(image);
    }

    return NextResponse.json(savedImages);

  } catch (err) {

    return NextResponse.json(
      { error: "Image upload failed" },
      { status: 500 }
    );
  }
}