import { isAuthenticated } from "@/lib/authentication";
import { connectDB } from "@/lib/db";
import { catchError, response } from "@/lib/helperFunction";
import CategoryModel from "@/models/Category.model";
// import mongoose from "mongoose";

export async function PUT(request) {
  try {
    const auth = await isAuthenticated('admin',request)
    if (!auth.isAuth){
        return response(false,403,'Unauthorized')
    }
    await connectDB();
    const payload = await request.json();
    const ids = payload.ids || [];
    const deleteType = payload.deleteType;

    if (!Array.isArray(ids) || ids.length === 0) {
      return response(false, 400, "Invalid or empty id list");
    }

    const category = await CategoryModel.find({ _id: { $in: ids } }).lean();
    if (!category.length) {
      return response(false, 404, "Data not found");
    }

    if (!["SD", "RSD"].includes(deleteType)) {
      return response(
        false,
        400,
        "Ivalid delete operation. Delete type should be SSD or RSD for this route"
      );
    }

    if (deleteType === "SD") {
      await CategoryModel.updateMany(
        { _id: { $in: ids } },
        { $set: { deletedAt: new Date().toISOString() } }
      );
    } else {
      await CategoryModel.updateMany(
        { _id: { $in: ids } },
        { $set: { deletedAt: null } }
      );
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
   const auth = await isAuthenticated('admin',request)
    if (!auth.isAuth){
        return response(false,403,'Unauthorized')
    }
    await connectDB();
    const payload = await request.json();
    const ids = payload.ids || [];
    const deleteType = payload.deleteType;

    if (!Array.isArray(ids) || ids.length === 0) {
      return response(false, 400, "Invalid or empty id list");
    }

    const category = await CategoryModel.find({ _id: { $in: ids } }).lean();
    if (!category.length) {
      return response(false, 404, "Data not found");
    }

    if (deleteType !== "PD") {
      return response(
        false,
        400,
        "Ivalid delete operation. Delete type should be SSD or RSD for this route"
      );
    }

    await CategoryModel.deleteMany({ _id: { $in: ids } });

    return response(true, 200, "Data deleted successfully");
  } catch (error) {
    return catchError(error);
  }
}
