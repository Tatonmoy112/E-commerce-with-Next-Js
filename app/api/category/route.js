import { isAuthenticated } from "@/lib/authentication";
import prisma from "@/lib/prisma";
import { catchError, response } from "@/lib/helperFunction";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const auth = await isAuthenticated('admin', request)
        if (!auth.isAuth){
            return response(false, 403, 'Unauthorized')
        }
      
        const searchParams = request.nextUrl.searchParams
        const start = parseInt(searchParams.get('start') || "0", 10)
        const size = parseInt(searchParams.get('size') || "10", 10)
        const filters = JSON.parse(searchParams.get('filters') || "[]")
        const globalFilter = searchParams.get('globalFilter') || ""
        const sorting = JSON.parse(searchParams.get('sorting') || "[]")
        const deleteType = searchParams.get('deleteType')

        let where = {};

        // Handle soft delete filtering
        if (deleteType === "SD") {
            where.deletedAt = null;
        } else if (deleteType === "PD") {
            where.deletedAt = { not: null };
        }

        // Global filter
        if (globalFilter) {
            where.OR = [
                { name: { contains: globalFilter, mode: 'insensitive' } },
                { slug: { contains: globalFilter, mode: 'insensitive' } }
            ];
        }

        // Column filters
        if (filters.length > 0) {
            where.AND = filters.map(filter => ({
                [filter.id]: { contains: filter.value, mode: 'insensitive' }
            }));
        }

        // Sorting
        let orderBy = sorting.map(sort => ({
            [sort.id]: sort.desc ? 'desc' : 'asc'
        }));

        if (orderBy.length === 0) {
            orderBy = [{ createdAt: 'desc' }];
        }

        // Execute query
        const getCategory = await prisma.category.findMany({
            where,
            orderBy,
            skip: start,
            take: size,
        });

        const totalRowCount = await prisma.category.count({ where });

        return NextResponse.json({
            success: true,
            data: getCategory,
            meta: { totalRowCount }
        });

    } catch (error) {
        return catchError(error);
    }
}