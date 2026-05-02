import { isAuthenticated } from "@/lib/authentication";
import { connectDB } from "@/lib/db";
import { catchError } from "@/lib/helperFunction";
import UserModel from "@/models/User.model";

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
        { name: { $regex: globalFilter, $options: "i" } },
        { email: { $regex: globalFilter, $options: "i" } },
        { phone: { $regex: globalFilter, $options: "i" } },
        { address: { $regex: globalFilter, $options: "i" } },
        { role: { $regex: globalFilter, $options: "i" } },
        ...(isVerifiedFilter !== null ? [{ isEmailVerified: isVerifiedFilter }] : []),
      ];
    }

    // Column filters
filters.forEach((filter) => {
  if (filter.id === "role") {
    matchQuery[filter.id] = filter.value.trim();
  } else if (filter.id === "isEmailVerified") {
    const val = filter.value.toLowerCase();
    matchQuery[filter.id] = val === "true" || val === "verified";
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
      { $match: matchQuery },
      { $sort: Object.keys(sortQuery).length ? sortQuery : { createdAt: -1 } },
      { $skip: start },
      { $limit: size },
      {
        $project: {
          _id: 1,
          role: 1,
          name: 1,
          email: 1,
          phone: 1,
          address: 1,
          avtar: 1,
          isEmailVerified: 1,
          createdAt: 1,
          updatedAt: 1,
          deletedAt: 1,
        },
      },
    ];

    const users = await UserModel.aggregate(aggregatePipeline);
    const totalRowCount = await UserModel.countDocuments(matchQuery);

    return NextResponse.json({
      success: true,
      data: users,
      meta: { totalRowCount },
    });
  } catch (error) {
    return catchError(error);
  }
}
