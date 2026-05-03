import { isAuthenticated } from "@/lib/authentication";
import prisma from "@/lib/prisma";
import { catchError, response } from "@/lib/helperFunction";

export async function PUT(request) {
  try {
    const auth = await isAuthenticated('admin', request)
    if (!auth.isAuth){
        return response(false, 403, 'Unauthorized')
    }
    
    const payload = await request.json();
    const ids = (payload.ids || []).filter(id => id && id !== 'null' && id !== 'undefined');
    const deleteType = payload.deleteType;

    if (!Array.isArray(ids) || ids.length === 0) {
      return response(false, 400, "Invalid or empty id list");
    }

    const categories = await prisma.category.findMany({
      where: { id: { in: ids } }
    });

    
    if (!categories.length) {
      return response(false, 404, "Data not found");
    }

    if (!["SD", "RSD"].includes(deleteType)) {
      return response(
        false,
        400,
        "Invalid delete operation. Delete type should be SD or RSD for this route"
      );
    }

    if (deleteType === "SD") {
      await prisma.category.updateMany({
        where: { id: { in: ids } },
        data: { deletedAt: new Date() }
      });
    } else {
      await prisma.category.updateMany({
        where: { id: { in: ids } },
        data: { deletedAt: null }
      });
    }

    return response(
      true,
      200,
      deleteType === "SD" ? "Data moved into trash" : "Data restored",
    );
  } catch (error) {
    return catchError(error);
  }
}

export async function DELETE(request) {
  try {
    const auth = await isAuthenticated('admin', request)
    if (!auth.isAuth){
        return response(false, 403, 'Unauthorized')
    }
    
    const payload = await request.json();
    const ids = (payload.ids || []).filter(id => id && id !== 'null' && id !== 'undefined');
    const deleteType = payload.deleteType;

    if (!Array.isArray(ids) || ids.length === 0) {
      return response(false, 400, "Invalid or empty id list");
    }

    const categories = await prisma.category.findMany({
      where: { id: { in: ids } }
    });

    
    if (!categories.length) {
      return response(false, 404, "Data not found");
    }

    if (deleteType !== "PD") {
      return response(
        false,
        400,
        "Invalid delete operation. Delete type should be PD for this route"
      );
    }

    // Delete associated products first
    // Note: We need to handle product dependencies too
    const products = await prisma.product.findMany({
      where: { categoryId: { in: ids } },
      select: { id: true }
    });
    
    const productIds = products.map(p => p.id);
    
    if (productIds.length > 0) {
      // Cleanup product dependencies
      await prisma.orderItem.deleteMany({ where: { productId: { in: productIds } } });
      await prisma.review.deleteMany({ where: { productId: { in: productIds } } });
      await prisma.productVariant.deleteMany({ where: { productId: { in: productIds } } });
      await prisma.product.deleteMany({ where: { id: { in: productIds } } });
    }

    await prisma.category.deleteMany({
      where: { id: { in: ids } }
    });

    return response(true, 200, "Data deleted successfully");
  } catch (error) {
    return catchError(error);
  }
}

