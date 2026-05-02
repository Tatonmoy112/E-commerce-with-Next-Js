import { isAuthenticated } from "@/lib/authentication";
import { connectDB } from "@/lib/db";
import { catchError } from "@/lib/helperFunction";
import ReviewModel from "@/models/Review.model";

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

    // Global search
    if (globalFilter) {
      const gfLower = globalFilter.toLowerCase();
      let isVerifiedFilter = null;
      if (gfLower === "true") isVerifiedFilter = true;
      else if (gfLower === "false") isVerifiedFilter = false;

      matchQuery["$or"] = [
        { 'productData.name': { $regex: globalFilter, $options: "i" } },
        { 'userData.name': { $regex: globalFilter, $options: "i" } },
        { rating: { $regex: globalFilter, $options: "i" } },
        { title: { $regex: globalFilter, $options: "i" } },
        { review: { $regex: globalFilter, $options: "i" } },
        
      ];
    }

    // Column filters
filters.forEach((filter) => {
  if (filter.id === "product") {
    matchQuery['productData.name'] = { $regex: filter.value, $options: "i" };
  } else if (filter.id === "user") {
    matchQuery['userData.name'] = { $regex: filter.value, $options: "i" };
  } else {
    matchQuery[filter.id] = { $regex: filter.value, $options: "i" };
  }
});


    // Sorting
    let sortQuery = {};
    sorting.forEach((sort) => {
      sortQuery[sort.id] = sort.desc ? -1 : 1;
    });

    const aggregatePipeline = [
     
     {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "productData",
        },
      },
     {
        $lookup: {
          from: "getReview",
          localField: "user",
          foreignField: "_id",
          as: "userData",
        },
      },
      { $unwind: { path: "$productData", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } },
      { $match: matchQuery },


      { $match: matchQuery },
      { $sort: Object.keys(sortQuery).length ? sortQuery : { createdAt: -1 } },
      { $skip: start },
      { $limit: size },
      {
        $project: {
          _id: 1,
          product: "$productData.name",
          user: "$userData.name",
          rating:1,
          title:1,
          rating:1,
          createdAt: 1,
          updatedAt: 1,
          deletedAt: 1,
        },
      },
    ];

    const getReview = await ReviewModel.aggregate(aggregatePipeline);
    const totalRowCount = await UserModel.countDocuments(matchQuery);

    return NextResponse.json({
      success: true,
      data: getReview,
      meta: { totalRowCount },
    });
  } catch (error) {
    return catchError(error);
  }
}
