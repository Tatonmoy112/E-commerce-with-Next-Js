import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Simple query to check connection
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      success: true,
      message: "✅ Successfully Connected to PostgreSQL via Prisma",
    });
  } catch (error) {
    console.error("❌ Prisma connection error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

