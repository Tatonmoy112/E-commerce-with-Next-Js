import { SignJWT } from "jose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { catchError, response } from "@/lib/helperFunction";
import { zschema } from "@/lib/ZodSchema";
import OTPModel from "@/models/Otp.model";
import UserModel from "@/models/User.model";

export async function POST(request) {
  try {
    await connectDB();

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

    const getOtpData = await OTPModel.findOne({ email, otp });
    if (!getOtpData) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired OTP" },
        { status: 404 }
      );
    }

    const getUser = await UserModel.findOne({ email, deletedAt: null }).lean();
    if (!getUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const loggedInUserData = {
      userId: getUser._id.toString(),
      role: getUser.role,
      name: getUser.name,
      avatar: getUser.avatar,
    };

    const secret = new TextEncoder().encode(process.env.SECRET_KEY);
    const token = await new SignJWT(loggedInUserData)
      .setIssuedAt()
      .setExpirationTime("24h")
      .setProtectedHeader({ alg: "HS256" })
      .sign(secret);

    await getOtpData.deleteOne();

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
