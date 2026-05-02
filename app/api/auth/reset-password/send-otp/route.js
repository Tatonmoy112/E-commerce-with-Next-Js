import { otpEmail } from "@/email/otpEmail";
import { connectDB } from "@/lib/db";
import { catchError, generateOTP, response } from "@/lib/helperFunction";
import { sendMail } from "@/lib/sendMail";
import { zschema } from "@/lib/ZodSchema";
import OTPModel from "@/models/Otp.model";
import UserModel from "@/models/User.model";

export async function POST(request) {

    try {
        
        await connectDB();
        const payload =  await request.json()
        const validationSchema = zschema.pick({
          email:true
        })

        const validatedData= validationSchema.safeParse(payload)
        if(!validatedData.success){
        return response(false,401,'Invalid or missing input field', validatedData.error )
        }
        const {email} = validatedData.data
         const getUser = await UserModel.findOne({deletedAt:null,email}).lean()
        if(!getUser){
            return response(false,404,"User not found")
        }
        
        await OTPModel.deleteMany({email})
        const otp =  generateOTP()
         const otpString = otp.toString();
        const newOtp = new OTPModel({
        email,
        otp: otpString,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        });
        await newOtp.save();

    // Send OTP email
       const  otpSendStatus= await sendMail("Your Login OTP", email, otpEmail(otpString));
        
        if(!otpSendStatus){
            return response(false,404,"Failed to send OTP")

        }

       return response(true,200,"Please verify your account")
    } catch (error) {
        
        return catchError(error)
    }
    
}