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

    // Global search (Order ID or User Name/Email)
    if (globalFilter) {
      where.OR = [
        { id: { contains: globalFilter, mode: 'insensitive' } },
        { user: { name: { contains: globalFilter, mode: 'insensitive' } } },
        { user: { email: { contains: globalFilter, mode: 'insensitive' } } },
        { shippingAddress: { contains: globalFilter, mode: 'insensitive' } },
      ];
    }

    // Column filters
    if (filters.length > 0) {
      where.AND = filters.map(filter => {
        if (filter.id === "status") {
          return { status: filter.value.toUpperCase() };
        }
        if (filter.id === "user") {
          return { user: { name: { contains: filter.value, mode: 'insensitive' } } };
        }
        if (typeof filter.value === 'string') {
            return { [filter.id]: { contains: filter.value, mode: 'insensitive' } };
        }
        return { [filter.id]: filter.value };
      });
    }

    // Sorting
    let orderBy = sorting.map(sort => {
        if (sort.id === 'user') return { user: { name: sort.desc ? 'desc' : 'asc' } };
        return { [sort.id]: sort.desc ? 'desc' : 'asc' };
    });

    if (orderBy.length === 0) {
      orderBy = [{ createdAt: 'desc' }];
    }

    // Execute query
    const orders = await prisma.order.findMany({
      where,
      orderBy,
      skip: start,
      take: size,
      include: {
        user: {
            select: {
                name: true,
                email: true,
                phone: true
            }
        },
        items: {
            include: {
                product: true
            }
        }
      }
    });

    const totalRowCount = await prisma.order.count({ where });

    return NextResponse.json({
      success: true,
      data: orders,
      meta: { totalRowCount },
    });
  } catch (error) {
    return catchError(error);
  }
}
