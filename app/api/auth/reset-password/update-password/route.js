import prisma from "@/lib/prisma";
import { catchError, response } from "@/lib/helperFunction";
import { zschema } from "@/lib/ZodSchema";
import bcrypt from "bcrypt";

export async function PUT(request){
    try {
        const payload = await request.json();
        const validationSchema = zschema.pick({
            email: true, 
            password: true
        })
        const validatedData = validationSchema.safeParse(payload)
        if (!validatedData.success) {
            return response(false, 401, 'Invalid or missing input field', validatedData.error)
        }
        
        const { email, password } = validatedData.data
        const user = await prisma.user.findFirst({
            where: { email, deletedAt: null }
        })
        
        if (!user) {
            return response(false, 404, "User not found")
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });

        return response(true, 200, "Password updated successfully")

    } catch (error) {
        return catchError(error);
    }
}