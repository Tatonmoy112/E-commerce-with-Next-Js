import { connectDB } from "@/lib/db";
import { response } from "@/lib/helperFunction";
import { sendMail } from "@/lib/sendMail";
import { zschema } from "@/lib/ZodSchema";
import UserModel from "@/models/User.model";
import { SignJWT } from "jose";
// import bcrypt from "bcrypt";
import { emailVerificationLink } from "@/email/emailVerification";
export async function POST(request) {
  try {
    await connectDB();

    const validationSchema = zschema.pick({ name: true, email: true, password: true });
    const payload = await request.json();
    const validatedData = validationSchema.safeParse(payload);
    if (!validatedData.success) return response(false, 401, "Invalid input", validatedData.error);

    const { name, email, password } = validatedData.data;

    const checkUser = await UserModel.exists({ email });
    if (checkUser) return response(false, 409, "User already registered");

    const newRegistration = new UserModel({ name, email, password });
await newRegistration.save();

    const secret = new TextEncoder().encode(process.env.SECRET_KEY);
    const token = await new SignJWT({ userId: newRegistration._id.toString() }) // <-- FIXED
      .setIssuedAt()
      .setExpirationTime("1h")
      .setProtectedHeader({ alg: "HS256" })
      .sign(secret);

   const verifyLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/verify-email?token=${token}`;

// generate HTML content
const htmlContent = emailVerificationLink(verifyLink);

await sendMail(
  "Email Verification - Next JS E-Commerce",
  email,
  htmlContent // <-- send the HTML, not plain text
);

    return response(true, 200, "Registration successful. Please verify your email address.");
  } catch (error) {
    console.error("❌ Registration error:", error);
    return response(false, 500, error.message || "Internal Server Error");
  }
}
