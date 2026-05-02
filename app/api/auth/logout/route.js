import { cookies } from "next/headers"

const { connectDB } = require("@/lib/db")
const { catchError, response } = require("@/lib/helperFunction")

export async function POST(request) {

    try {
        await connectDB()

        const cookieStore = await cookies()
        cookieStore.delete('access_token')  
        return response(true,200 ,'Logout successful')   
    } catch (error) {
        
        catchError(error)
    }
    
}