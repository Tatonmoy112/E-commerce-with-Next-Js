import cloudinary from "@/lib/cloudinary";
import { catchError, response } from "@/lib/helperFunction";
import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/authentication";

export async function POST(request){
    try {
        const auth = await isAuthenticated('admin', request)
        if (!auth.isAuth){
            return response(false, 403, 'Unauthorized')
        }

        const payload = await request.json()
        const {paramsToSign} = payload
        const signature = cloudinary.utils.api_sign_request(paramsToSign,process.env.CLOUDINARY_SECRET_KEY)
        return NextResponse.json({signature})
        
    } catch (error) {
        return catchError(error)
    }
}