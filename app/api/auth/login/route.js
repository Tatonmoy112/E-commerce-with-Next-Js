// app/api/auth/login/route.js
import prisma from "@/lib/prisma";
import { response } from "@/lib/helperFunction";
import { sendMail } from "@/lib/sendMail";
import { zschema } from "@/lib/ZodSchema";
import { SignJWT } from "jose";
import bcrypt from "bcrypt";
import { emailVerificationLink } from "@/email/emailVerification";
import { otpEmail } from "@/email/otpEmail";
import { generateOTP } from "@/lib/helperFunction";

export async function POST(request) {
  try {
    // Validate input
    const validationSchema = zschema.pick({ email: true, password: true });
    const payload = await request.json();
    const validatedData = validationSchema.safeParse(payload);

    if (!validatedData.success) {
      return response(false, 400, "Invalid input", validatedData.error);
    }

    const { email, password } = validatedData.data;

    // Find user
    const user = await prisma.user.findFirst({
      where: {
        email,
        deletedAt: null
      }
    });

    if (!user) return response(false, 404, "Invalid credentials");

    // Check email verification
    if (!user.isEmailVerified) {
      const secret = new TextEncoder().encode(process.env.SECRET_KEY);
      const token = await new SignJWT({ userId: user.id })
        .setIssuedAt()
        .setExpirationTime("1h")
        .setProtectedHeader({ alg: "HS256" })
        .sign(secret);

      const verifyLink = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify-email?token=${token}`;
      const htmlContent = emailVerificationLink(verifyLink);

      try {
        await sendMail("Email Verification - Next JS E-Commerce", email, htmlContent);
      } catch (emailError) {
        console.warn("⚠️ Email sending failed:", emailError.message);
      }

      return response(false, 401, "Email not verified. Verification link sent.");
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
        return response(false, 404, "Invalid credentials");
    }

    // Generate OTP
    await prisma.otp.deleteMany({ where: { email } }); // clear previous OTPs
    const otp = generateOTP(); // number
    const otpString = otp.toString(); // ensure string
    
    await prisma.otp.create({
      data: {
        email,
        otp: otpString,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      }
    });

    // Send OTP email (non-fatal if SMTP is not configured)
    let otpSendFailed = false;
    try {
      await sendMail("Your Login OTP", email, otpEmail(otpString));
    } catch (emailError) {
      console.warn("⚠️ OTP email failed:", emailError.message);
      otpSendFailed = true;
    }

    // In dev mode, always include OTP in response for easy testing
    const responseData = { email };
    if (process.env.NODE_ENV !== 'production') {
      responseData.otp = otpString;
    }

    return response(true, 200, "OTP sent successfully", responseData);
  } catch (error) {
    console.error("❌ Login error:", error);
    return response(false, 500, error.message || "Internal Server Error");
  }
}

