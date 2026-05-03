import prisma from "@/lib/prisma";
import { catchError, response } from "@/lib/helperFunction";
import { zschema } from "@/lib/ZodSchema";

export async function POST(request) {
  try {
    const payload = await request.json()
    const validationSchema = zschema.pick({
      otp: true, 
      email: true
    })

    const validatedData = validationSchema.safeParse(payload)
    if (!validatedData.success) {
      return response(false, 401, 'Invalid or missing input field', validatedData.error)
    }
    
    const { email, otp } = validatedData.data
    const otpData = await prisma.otp.findFirst({
      where: { email, otp }
    })
    
    if (!otpData) {
      return response(false, 404, 'Invalid or expired otp')
    }
    
    const user = await prisma.user.findFirst({
      where: { email, deletedAt: null }
    })
    
    if (!user) {
      return response(false, 404, "User not found")
    }

    await prisma.otp.delete({
      where: { id: otpData.id }
    })

    return response(true, 200, "OTP Verified", { email })

  } catch (error) {
     return catchError(error)
  }
}