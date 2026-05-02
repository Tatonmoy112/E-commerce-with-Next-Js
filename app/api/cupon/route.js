import { isAuthenticated } from "@/lib/authentication";
import { connectDB } from "@/lib/db";
import { catchError } from "@/lib/helperFunction";
import CuponModel from "@/models/Cupon.model";

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
        { code: { $regex: globalFilter, $options: "i" } },
    { $expr: { $regexMatch: { input: { $toString: "$minimumShoppingAmount" }, regex: globalFilter, options: "i" } } },
    { $expr: { $regexMatch: { input: { $toString: "$discountPercentage" }, regex: globalFilter, options: "i" } } },

      ];
    }

    //column filteration

    filters.forEach((filter) => {
  // Check if the filter field is numeric
  if (["minimumShoppingAmount" , "discountPercentage"].includes(filter.id)) {
    // Convert filter value to number
    matchQuery[filter.id] = Number(filter.value);
  }else if(filter.id === "validity"){
          matchQuery[filter.id] =  newDate(filter.value)
  } else {
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
      
      { $match: matchQuery },
      { $sort: Object.keys(sortQuery).length ? sortQuery : { createdAt: -1 } },
      { $skip: start },
      { $limit: size },
      {
        $project: {
          _id: 1,
          code: 1,
          minimumShoppingAmount: 1,
          discountPercentage: 1,
          validity : 1,
          createdAt: 1,
          updatedAt: 1,
          deletedAt: 1,
        },
      },
    ];

    // Execute query

    const getCupon = await CuponModel.aggregate(aggregatePipeline);
    // get total row count

    const totalRowCount = await CuponModel.countDocuments(matchQuery);

    return NextResponse.json({
      success: true,
      data: getCupon,
      meta: { totalRowCount },
    });
  } catch (error) {
    return catchError(error);
  }
}
