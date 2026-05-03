// Fixed duplicate searchParams declaration
import { isAuthenticated } from "@/lib/authentication";
import prisma from "@/lib/prisma";
import { catchError, response } from "@/lib/helperFunction";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const auth = await isAuthenticated("admin", request);
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get("productId");

    // Public view: Get reviews for a specific product
    if (productId && !auth.isAuth) {
      const reviews = await prisma.review.findMany({
        where: { productId, deletedAt: null },
        include: { user: { select: { name: true, avatar_url: true } } },
        orderBy: { createdAt: 'desc' }
      });
      return response(true, 200, "Reviews fetched", reviews);
    }

    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized");
    }

    const start = parseInt(searchParams.get("start") || "0", 10);
    const size = parseInt(searchParams.get("size") || "10", 10);
    const filters = JSON.parse(searchParams.get("filters") || "[]");
    const globalFilter = searchParams.get("globalFilter") || "";
    const sorting = JSON.parse(searchParams.get("sorting") || "[]");
    const deleteType = searchParams.get("deleteType");

    let where = {};

    // Soft delete filtering
    if (deleteType === "SD") {
      where.deletedAt = null;
    } else if (deleteType === "PD") {
      where.deletedAt = { not: null };
    }

    // Global filter
    if (globalFilter) {
      const orConditions = [
        { title: { contains: globalFilter, mode: 'insensitive' } },
        { review: { contains: globalFilter, mode: 'insensitive' } },
        { product: { name: { contains: globalFilter, mode: 'insensitive' } } },
        { user: { name: { contains: globalFilter, mode: 'insensitive' } } }
      ];

      const numFilter = parseFloat(globalFilter);
      if (!isNaN(numFilter)) {
        orConditions.push({ rating: numFilter });
      }

      where.OR = orConditions;
    }

    // Column filtration
    if (filters.length > 0) {
      where.AND = filters.map(filter => {
        if (filter.id === "rating") {
          return { rating: parseFloat(filter.value) };
        }
        if (filter.id === "product") {
          return { product: { name: { contains: filter.value, mode: 'insensitive' } } };
        }
        if (filter.id === "user") {
          return { user: { name: { contains: filter.value, mode: 'insensitive' } } };
        }
        return { [filter.id]: { contains: filter.value, mode: 'insensitive' } };
      });
    }

    // Sorting
    let orderBy = sorting.map(sort => {
        if (sort.id === "product") return { product: { name: sort.desc ? 'desc' : 'asc' } };
        if (sort.id === "user") return { user: { name: sort.desc ? 'desc' : 'asc' } };
        return { [sort.id]: sort.desc ? 'desc' : 'asc' };
    });

    if (orderBy.length === 0) {
      orderBy = [{ createdAt: 'desc' }];
    }

    // Execute query
    const reviews = await prisma.review.findMany({
      where,
      orderBy,
      skip: start,
      take: size,
      include: {
        product: true,
        user: true,
      }
    });

    // Format output to match frontend expectation
    const formattedReviews = reviews.map(r => ({
        ...r,
        product: r.product ? r.product.name : null,
        user: r.user ? r.user.name : null,
    }));

    const totalRowCount = await prisma.review.count({ where });

    return NextResponse.json({
      success: true,
      data: formattedReviews,
      meta: { totalRowCount },
    });
  } catch (error) {
    return catchError(error);
  }
}

export async function POST(request) {
  try {
    const auth = await isAuthenticated("user", request);
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized. Please login to provide a review.");
    }

    const { productId, rating, title, review } = await request.json();

    if (!productId || !rating || !review) {
      return response(false, 400, "Missing required fields: productId, rating, and review are required.");
    }

    // Check if user has already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        productId,
        userId: auth.user.id,
        deletedAt: null
      }
    });

    if (existingReview) {
      return response(false, 400, "You have already reviewed this product.");
    }

    const newReview = await prisma.review.create({
      data: {
        productId,
        userId: auth.user.id,
        rating: parseFloat(rating),
        title: title || "",
        review
      }
    });

    return response(true, 201, "Review submitted successfully!", newReview);
  } catch (error) {
    return catchError(error);
  }
}

