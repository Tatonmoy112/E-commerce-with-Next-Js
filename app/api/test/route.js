import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("🧠 MONGODB_URL:", process.env.MONGODB_URL); // 👈 log it for debugging

    await connectDB();

    return NextResponse.json({
      success: true,
      message: "✅ Successfully Connected to MongoDB",
    });
  } catch (error) {
    console.error("❌ DB connection error:", error); // 👈 log the actual error
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
