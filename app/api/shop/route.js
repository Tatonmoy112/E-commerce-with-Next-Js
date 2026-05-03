import prisma from "@/lib/prisma";
import { catchError, response } from "@/lib/helperFunction";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {    
    const searchParams = request.nextUrl.searchParams;
    
    const sizeFilter = searchParams.get('size');
    const colorFilter = searchParams.get('color');
    const minPrice = parseInt(searchParams.get('minPrice')) || 0;
    const maxPrice = parseInt(searchParams.get('maxPrice')) || 1000000;
    const categorySlug = searchParams.get('category');
    const search = searchParams.get('q');

    // pagination
    const limit = parseInt(searchParams.get('limit')) || 9;
    const page = parseInt(searchParams.get('page')) || 0;
    const skip = page * limit;

    // sorting 
    const sortOption = searchParams.get('sort') || 'default_sorting';
    let orderBy = { createdAt: 'desc' };
    if (sortOption === 'asc') orderBy = { name: 'asc' };
    if (sortOption === 'desc') orderBy = { name: 'desc' };
    if (sortOption === 'price_low_high') orderBy = { sellingPrice: 'asc' };
    if (sortOption === 'price_high_low') orderBy = { sellingPrice: 'desc' };

    let where = {
        deletedAt: null,
    };

    if (categorySlug && categorySlug !== 'all') {
        where.category = { slug: categorySlug };
    }

    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
        ];
    }

    // Price and variant filters
    let variantWhere = {};
    if (sizeFilter) variantWhere.size = sizeFilter;
    if (colorFilter) variantWhere.color = colorFilter;
    
    // If there are variant-specific filters, use 'some'
    if (Object.keys(variantWhere).length > 0) {
        where.variants = {
            some: variantWhere
        };
    }

    // Base price filter (on product itself or its variants)
    where.sellingPrice = { gte: minPrice, lte: maxPrice };

    const products = await prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        category: true,
        media: true,
        variants: true
      }
    });

    const totalCount = await prisma.product.count({ where });

    return NextResponse.json({
      success: true,
      data: products,
      meta: {
        totalCount,
        page,
        limit
      }
    });
   
  } catch (error) {
    return catchError(error);
  }
}

