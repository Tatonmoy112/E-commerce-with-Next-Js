// app/api/auth/login/route.js
import { connectDB } from "@/lib/db";
import { response } from "@/lib/helperFunction";
import { sendMail } from "@/lib/sendMail";
import { zschema } from "@/lib/ZodSchema";
import UserModel from "@/models/User.model";
import OTPModel from "@/models/Otp.model";
import { SignJWT } from "jose";
// import bcrypt from "bcrypt";
import { emailVerificationLink } from "@/email/emailVerification";
import { otpEmail } from "@/email/otpEmail";
import { generateOTP } from "@/lib/helperFunction";

export async function POST(request) {
  try {
    await connectDB();

    // Validate input
    const validationSchema = zschema.pick({ email: true, password: true });
    const payload = await request.json();
    const validatedData = validationSchema.safeParse(payload);

    if (!validatedData.success) {
      return response(false, 400, "Invalid input", validatedData.error);
    }

    const { email, password } = validatedData.data;

    // Find user
    const user = await UserModel.findOne({ email, deletedAt: null }).select("+password");
    if (!user) return response(false, 404, "Invalid credentials");

    // Check email verification
    if (!user.isEmailVerified) {
      const secret = new TextEncoder().encode(process.env.SECRET_KEY);
      const token = await new SignJWT({ userId: user._id.toString() })
        .setIssuedAt()
        .setExpirationTime("1h")
        .setProtectedHeader({ alg: "HS256" })
        .sign(secret);

      const verifyLink = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify-email?token=${token}`;
      const htmlContent = emailVerificationLink(verifyLink);

      await sendMail("Email Verification - Next JS E-Commerce", email, htmlContent);

      return response(false, 401, "Email not verified. Verification link sent.");
    }

    // Verify password
      const isValid = await user.comparePassword(password);

    if (!isValid) {
        console.log("Entered:", password);
        console.log("Stored:", user.password); // hashed
        return response(false, 404, "Invalid credentials");
    }
    // Generate OTP
    await OTPModel.deleteMany({ email }); // clear previous OTPs
    const otp =  generateOTP(); // number
    const otpString = otp.toString(); // ensure string
    const newOtp = new OTPModel({
      email,
      otp: otpString,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    await newOtp.save();

    // Send OTP email
    await sendMail("Your Login OTP", email, otpEmail(otpString));

    return response(true, 200, "OTP sent successfully", { email });
  } catch (error) {
    console.error("❌ Login error:", error);
    return response(false, 500, error.message || "Internal Server Error");
  }
}
