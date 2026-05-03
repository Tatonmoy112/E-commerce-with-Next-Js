import prisma from "@/lib/prisma";
import { response } from "@/lib/helperFunction";
import { sendMail } from "@/lib/sendMail";
import { zschema } from "@/lib/ZodSchema";
import { SignJWT } from "jose";
import bcrypt from "bcrypt";
import { emailVerificationLink } from "@/email/emailVerification";

export async function POST(request) {
  try {
    const validationSchema = zschema.pick({ name: true, email: true, password: true });
    const payload = await request.json();
    const validatedData = validationSchema.safeParse(payload);
    if (!validatedData.success) return response(false, 401, "Invalid input", validatedData.error);

    const { name, email, password } = validatedData.data;

    const checkUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (checkUser) return response(false, 409, "User already registered");

    // Hash password manually
    const hashedPassword = await bcrypt.hash(password, 10);

    const newRegistration = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      }
    });

    const secret = new TextEncoder().encode(process.env.SECRET_KEY);
    const token = await new SignJWT({ userId: newRegistration.id })
      .setIssuedAt()
      .setExpirationTime("1h")
      .setProtectedHeader({ alg: "HS256" })
      .sign(secret);

    const verifyLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/verify-email?token=${token}`;

    // Try to send verification email (non-fatal if SMTP is not configured)
    try {
      const htmlContent = emailVerificationLink(verifyLink);
      await sendMail(
        "Email Verification - Next JS E-Commerce",
        email,
        htmlContent
      );
    } catch (emailError) {
      console.warn("⚠️ Email sending failed (SMTP not configured?):", emailError.message);
    }

    return response(true, 200, "Registration successful. Please verify your email address.");
  } catch (error) {
    console.error("❌ Registration error:", error);
    return response(false, 500, error.message || "Internal Server Error");
  }
}

