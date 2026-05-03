import { isAuthenticated } from "@/lib/authentication";
import prisma from "@/lib/prisma";
import { catchError, response } from "@/lib/helperFunction";

export async function PUT(request) {
  try {
    const auth = await isAuthenticated('admin', request);
    if (!auth.isAuth) {
      return response(false, 403, 'Unauthorized');
    }

    const payload = await request.json();
    const ids = (payload.ids || []).filter(id => id && id !== 'null' && id !== 'undefined');
    const deleteType = payload.deleteType;

    if (!Array.isArray(ids) || ids.length === 0) {
      return response(false, 400, "Invalid or empty id list");
    }

    if (!["SD", "RSD"].includes(deleteType)) {
      return response(false, 400, "Invalid delete operation. Use SD or RSD for this route");
    }

    if (deleteType === "SD") {
      await prisma.order.updateMany({
        where: { id: { in: ids } },
        data: { deletedAt: new Date() }
      });
    } else {
      await prisma.order.updateMany({
        where: { id: { in: ids } },
        data: { deletedAt: null }
      });
    }

    return response(
      true,
      200,
      deleteType === "SD" ? "Orders moved to trash" : "Orders restored successfully"
    );
  } catch (error) {
    return catchError(error);
  }
}

export async function DELETE(request) {
  try {
    const auth = await isAuthenticated('admin', request);
    if (!auth.isAuth) {
      return response(false, 403, 'Unauthorized');
    }

    const payload = await request.json();
    const ids = (payload.ids || []).filter(id => id && id !== 'null' && id !== 'undefined');
    const deleteType = payload.deleteType;

    if (!Array.isArray(ids) || ids.length === 0) {
      return response(false, 400, "Invalid or empty id list");
    }

    if (deleteType !== "PD") {
      return response(false, 400, "Invalid delete operation. Use PD for this route");
    }

    // Delete associated OrderItems first to maintain integrity
    await prisma.orderItem.deleteMany({
      where: { orderId: { in: ids } }
    });

    await prisma.order.deleteMany({
      where: { id: { in: ids } }
    });

    return response(true, 200, "Orders deleted permanently");
  } catch (error) {
    return catchError(error);
  }
}
