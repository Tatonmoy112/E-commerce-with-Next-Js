import prisma from "@/lib/prisma";
import { catchError, response } from "@/lib/helperFunction";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    console.log("Fetching product with slug:", slug);

    const product = await prisma.product.findFirst({
      where: { slug, deletedAt: null },
      include: {
        category: true,
        media: true,
        variants: {
            where: { deletedAt: null }
        },
        reviews: {
            where: { deletedAt: null },
            include: {
                user: {
                    select: {
                        name: true,
                        avatar_url: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        }
      }
    });

    console.log("Product found in DB:", product ? "Yes" : "No");

    if (!product) {
      console.log("Returning 404 for slug:", slug);
      return response(false, 404, "Product not found. The requested slug may be incorrect or the product has been removed.");
    }

    return NextResponse.json({
      success: true,
      data: product
    });
   
  } catch (error) {
    return catchError(error);
  }
}
