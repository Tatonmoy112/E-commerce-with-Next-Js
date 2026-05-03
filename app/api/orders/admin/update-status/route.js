import { isAuthenticated } from "@/lib/authentication";
import prisma from "@/lib/prisma";
import { catchError, response } from "@/lib/helperFunction";

export async function POST(request) {
  try {
    const auth = await isAuthenticated("admin", request);
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized");
    }

    const payload = await request.json();
    const { id, status } = payload;

    const validStatuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return response(false, 400, "Invalid order status");
    }

    if (!id) {
      return response(false, 400, "Order ID is required");
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status }
    });

    return response(true, 200, `Order status updated to ${status}`, updatedOrder);
  } catch (error) {
    return catchError(error);
  }
}
