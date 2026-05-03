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
        { color: { contains: globalFilter, mode: 'insensitive' } },
        { size: { contains: globalFilter, mode: 'insensitive' } },
        { sku: { contains: globalFilter, mode: 'insensitive' } },
        { product: { name: { contains: globalFilter, mode: 'insensitive' } } }
      ];

      const numFilter = parseFloat(globalFilter);
      if (!isNaN(numFilter)) {
        orConditions.push({ mrp: numFilter });
        orConditions.push({ sellingPrice: numFilter });
        orConditions.push({ discountPercentage: numFilter });
      }

      where.OR = orConditions;
    }

    // Column filtration
    if (filters.length > 0) {
      where.AND = filters.map(filter => {
        if (["mrp", "sellingPrice", "discountPercentage"].includes(filter.id)) {
          return { [filter.id]: parseFloat(filter.value) };
        }
        if (filter.id === "product") {
          return { product: { name: { contains: filter.value, mode: 'insensitive' } } };
        }
        return { [filter.id]: { contains: filter.value, mode: 'insensitive' } };
      });
    }

    // Sorting
    let orderBy = sorting.map(sort => {
        if (sort.id === "product") {
            return { product: { name: sort.desc ? 'desc' : 'asc' } };
        }
        return { [sort.id]: sort.desc ? 'desc' : 'asc' };
    });

    if (orderBy.length === 0) {
      orderBy = [{ createdAt: 'desc' }];
    }

    // Execute query
    const variants = await prisma.productVariant.findMany({
      where,
      orderBy,
      skip: start,
      take: size,
      include: {
        product: true,
      }
    });

    // Format output to match frontend expectation
    const formattedVariants = variants.map(v => ({
        ...v,
        product: v.product ? v.product.name : null,
    }));

    const totalRowCount = await prisma.productVariant.count({ where });

    return NextResponse.json({
      success: true,
      data: formattedVariants,
      meta: { totalRowCount },
    });
  } catch (error) {
    return catchError(error);
  }
}

