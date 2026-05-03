import { isAuthenticated } from "@/lib/authentication";
import prisma from "@/lib/prisma";
import { catchError, response } from "@/lib/helperFunction";

export async function POST(request) {
  try {
    const auth = await isAuthenticated('user', request);
    if (!auth.isAuth) {
      return response(false, 401, "Please login as a user to place an order");
    }

    const payload = await request.json();
    const { cartItems, shippingAddress } = payload;

    if (!cartItems || cartItems.length === 0) {
      return response(false, 400, "Cart is empty");
    }

    // Calculate total on the server to prevent spoofing
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of cartItems) {
      const dbProduct = await prisma.product.findUnique({
        where: { id: item.id }
      });

      if (!dbProduct) throw new Error(`Product ${item.id} not found`);

      // SECURITY: Validate quantity to prevent negative/zero quantity exploits
      const quantity = Math.max(1, parseInt(item.cartQuantity) || 1);

      const price = dbProduct.sellingPrice;
      totalAmount += price * quantity;

      orderItemsData.push({
        productId: item.id,
        quantity: quantity,
        price: price
      });
    }

    // Create Order with Items
    const newOrder = await prisma.order.create({
      data: {
        userId: auth.userId,
        totalAmount,
        payableAmount: totalAmount, // apply coupon logic here if needed later
        shippingAddress: shippingAddress || "Default Address",
        items: {
          create: orderItemsData
        }
      }
    });

    return response(true, 201, "Order placed successfully", newOrder);
  } catch (error) {
    return catchError(error);
  }
}
