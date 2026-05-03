import { isAuthenticated } from "@/lib/authentication";
import prisma from "@/lib/prisma";
import { catchError, response } from "@/lib/helperFunction";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const auth = await isAuthenticated("admin", request);
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized");
    }

    const searchParams = request.nextUrl.searchParams;
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

