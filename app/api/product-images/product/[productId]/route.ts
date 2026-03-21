import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const resolvedParams = await params;

  const images = await prisma.productImage.findMany({
    where: { productId: Number(resolvedParams.productId) },
    orderBy: { id: "asc" }
  });

  return NextResponse.json(images);
}