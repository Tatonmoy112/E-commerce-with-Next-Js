import { isAuthenticated } from "@/lib/authentication";
import prisma from "@/lib/prisma";
import { catchError, response } from "@/lib/helperFunction";

export async function GET(request) {
    try {
        const auth = await isAuthenticated("admin", request);
        if (!auth.isAuth) {
          return response(false, 403, "Unauthorized");
        }
    
        const [category, product, customer] = await Promise.all([
            prisma.category.count({ where: { deletedAt: null } }),
            prisma.product.count({ where: { deletedAt: null } }),
            prisma.user.count({ where: { deletedAt: null } }),
        ]);

        return response(true, 200, "Dashboard count", {
            category, product, customer
        });
        
    } catch (error) {
        return catchError(error);
    }
}