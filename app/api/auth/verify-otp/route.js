import { SignJWT } from "jose";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { catchError, response } from "@/lib/helperFunction";
import { zschema } from "@/lib/ZodSchema";

export async function POST(request) {
  try {
    const payload = await request.json();
    const validationSchema = zschema.pick({ otp: true, email: true });
    const validatedData = validationSchema.safeParse(payload);

    if (!validatedData.success) {
      return NextResponse.json(
        { success: false, message: "Invalid input", error: validatedData.error },
        { status: 400 }
      );
    }

    const { email, otp } = validatedData.data;

    const getOtpData = await prisma.otp.findFirst({
      where: { email, otp }
    });
    
    if (!getOtpData) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired OTP" },
        { status: 404 }
      );
    }

    const getUser = await prisma.user.findUnique({
      where: { email, deletedAt: null }
    });
    
    if (!getUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const loggedInUserData = {
      userId: getUser.id,
      role: getUser.role,
      name: getUser.name,
      avatar: getUser.avatar_url,
    };

    const secret = new TextEncoder().encode(process.env.SECRET_KEY);
    const token = await new SignJWT(loggedInUserData)
      .setIssuedAt()
      .setExpirationTime("24h")
      .setProtectedHeader({ alg: "HS256" })
      .sign(secret);

    await prisma.otp.delete({
      where: { id: getOtpData.id }
    });

    // ✅ Set cookie using NextResponse
    const res = NextResponse.json({ success: true, message: "Login Successful", data: loggedInUserData });
    res.cookies.set({
      name: "access_token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res;
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message || "Server Error" }, { status: 500 });
  }
}

