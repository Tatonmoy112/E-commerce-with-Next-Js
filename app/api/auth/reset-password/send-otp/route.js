import { otpEmail } from "@/email/otpEmail";
import prisma from "@/lib/prisma";
import { catchError, generateOTP, response } from "@/lib/helperFunction";
import { sendMail } from "@/lib/sendMail";
import { zschema } from "@/lib/ZodSchema";

export async function POST(request) {
    try {
        const payload = await request.json()
        const validationSchema = zschema.pick({
          email: true
        })

        const validatedData = validationSchema.safeParse(payload)
        if (!validatedData.success) {
            return response(false, 401, 'Invalid or missing input field', validatedData.error)
        }
        
        const { email } = validatedData.data
        const user = await prisma.user.findFirst({
            where: { email, deletedAt: null }
        })
        
        if (!user) {
            return response(false, 404, "User not found")
        }
        
        await prisma.oTP.deleteMany({
            where: { email }
        })

        const otp = generateOTP()
        const otpString = otp.toString();
        
        await prisma.oTP.create({
            data: {
                email,
                otp: otpString,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            }
        });

        // Send OTP email
        const otpSendStatus = await sendMail("Your Login OTP", email, otpEmail(otpString));
        
        if (!otpSendStatus) {
            return response(false, 404, "Failed to send OTP")
        }

        return response(true, 200, "Please verify your account")
    } catch (error) {
        return catchError(error)
    }
}