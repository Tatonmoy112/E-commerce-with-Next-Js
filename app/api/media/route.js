import prisma from "@/lib/prisma";
import { catchError } from "@/lib/helperFunction";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || "0", 10);
        const limit = parseInt(searchParams.get('limit') || "10", 10);
        const deleteType = searchParams.get('deleteType');

        let where = {};
        if (deleteType === "SD") {
            where.deletedAt = null;
        } else if (deleteType === "PD") {
            where.deletedAt = { not: null };
        }

        const mediaData = await prisma.media.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: page * limit,
            take: limit,
        });

        const totalMedia = await prisma.media.count({ where });

        return NextResponse.json({
            mediaData,
            hasMore: ((page + 1) * limit) < totalMedia
        });

    } catch (error) {
        return catchError(error);
    }
}