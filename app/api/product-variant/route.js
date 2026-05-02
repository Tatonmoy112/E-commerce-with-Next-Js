import { isAuthenticated } from "@/lib/authentication";
import { connectDB } from "@/lib/db";
import { catchError } from "@/lib/helperFunction";
import ProductVariantModel from "@/models/ProductVariant.model";

import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const auth = await isAuthenticated("admin", request);
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized");
    }

    await connectDB();
    const searchParams = request.nextUrl.searchParams;
    const start = parseInt(searchParams.get("start") || 0, 10);
    const size = parseInt(searchParams.get("size") || 0, 10);
    const filters = JSON.parse(searchParams.get("filters") || "[]");
    const globalFilter = searchParams.get("globalFilter") || "";
    const sorting = JSON.parse(searchParams.get("sorting") || "[]");
    const deleteType = searchParams.get("deleteType");

    let matchQuery = {};

    if (deleteType === "SD") {
      matchQuery = { deletedAt: null };
    } else if (deleteType === "PD") {
      matchQuery = { deletedAt: { $ne: null } };
    }

    if (globalFilter) {
      matchQuery["$or"] = [
        { color: { $regex: globalFilter, $options: "i" } },
        { size: { $regex: globalFilter, $options: "i" } },
        { sku: { $regex: globalFilter, $options: "i" } },
        {"productData.name" : { $regex: globalFilter, $options: "i" } },
        { $expr: { $regexMatch: { input: { $toString: "$mrp" }, regex: globalFilter, options: "i" } } },
    { $expr: { $regexMatch: { input: { $toString: "$sellingPrice" }, regex: globalFilter, options: "i" } } },
    { $expr: { $regexMatch: { input: { $toString: "$discountPercentage" }, regex: globalFilter, options: "i" } } },
      ];
    }

    //column filteration

    filters.forEach((filter) => {
  // Check if the filter field is numeric
  if (["mrp", "sellingPrice", "discountPercentage"].includes(filter.id)) {
    // Convert filter value to number
    matchQuery[filter.id] = Number(filter.value);
  }else if(filter.id === "product"){
     matchQuery["productData.name"] = { $regex: filter.value, $options: "i" };
  }
   else {
    // Keep regex for string fields
    matchQuery[filter.id] = { $regex: filter.value, $options: "i" };
  }
});

    // sorting

    let sortQuery = {};
    sorting.forEach((sort) => {
      sortQuery[sort.id] = sort.desc ? -1 : 1;
    });

    // aggregate pipeline

    const aggregatePipeline = [
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "productData",
        },
      },
      { $unwind: { path: "$productData", preserveNullAndEmptyArrays: true } },
      { $match: matchQuery },
      { $sort: Object.keys(sortQuery).length ? sortQuery : { createdAt: -1 } },
      { $skip: start },
      { $limit: size },
      {
        $project: {
          _id: 1,
          product: "$productData.name",
          color:1,
          size: 1,
          sku:1,
          mrp: 1,
          sellingPrice: 1,
          discountPercentage: 1,
          createdAt: 1,
          updatedAt: 1,
          deletedAt: 1,
        },
      },
    ];

    // Execute query

    const getProductVariant = await ProductVariantModel.aggregate(aggregatePipeline);
    // get total row count

    const totalRowCount = await ProductVariantModel.countDocuments(matchQuery);

    return NextResponse.json({
      success: true,
      data: getProductVariant,
      meta: { totalRowCount },
    });
  } catch (error) {
    return catchError(error);
  }
}
