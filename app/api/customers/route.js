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

    // Global search
    if (globalFilter) {
      const gfLower = globalFilter.toLowerCase();
      let isVerifiedFilter = null;
      if (gfLower === "true" || gfLower === "verified") isVerifiedFilter = true;
      else if (gfLower === "false" || gfLower === "unverified") isVerifiedFilter = false;

      where.OR = [
        { name: { contains: globalFilter, mode: 'insensitive' } },
        { email: { contains: globalFilter, mode: 'insensitive' } },
        { phone: { contains: globalFilter, mode: 'insensitive' } },
        { address: { contains: globalFilter, mode: 'insensitive' } },
      ];

      if (isVerifiedFilter !== null) {
        where.OR.push({ isEmailVerified: isVerifiedFilter });
      }
    }

    // Column filters
    if (filters.length > 0) {
      where.AND = filters.map(filter => {
        if (filter.id === "isEmailVerified") {
          const val = filter.value.toLowerCase();
          return { isEmailVerified: val === "true" || val === "verified" };
        }
        if (filter.id === "role") {
          return { role: filter.value.trim() };
        }
        return { [filter.id]: { contains: filter.value, mode: 'insensitive' } };
      });
    }

    // Sorting
    let orderBy = sorting.map(sort => ({
        [sort.id]: sort.desc ? 'desc' : 'asc'
    }));

    if (orderBy.length === 0) {
      orderBy = [{ createdAt: 'desc' }];
    }

    // Execute query
    const users = await prisma.user.findMany({
      where,
      orderBy,
      skip: start,
      take: size,
      select: {
        id: true,
        role: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        avatar_url: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      }
    });

    const totalRowCount = await prisma.user.count({ where });

    return NextResponse.json({
      success: true,
      data: users,
      meta: { totalRowCount },
    });
  } catch (error) {
    return catchError(error);
  }
}

