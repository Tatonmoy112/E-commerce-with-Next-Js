import { jwtVerify } from "jose";
import { cookies } from "next/headers";

export const isAuthenticated = async (role, request) => {
  try {
    // Get cookie from request headers
    const cookieHeader = request.headers.get("cookie") || "";
    const cookiesObj = Object.fromEntries(
      cookieHeader
        .split(";")
        .map((c) => c.trim().split("="))
        .map(([k, v]) => [k, decodeURIComponent(v)])
    );

    const accessToken = cookiesObj["access_token"];
    if (!accessToken) {
      return { isAuth: false };
    }

    const { payload } = await jwtVerify(
      accessToken,
      new TextEncoder().encode(process.env.SECRET_KEY)
    );

    if (role && payload.role !== role) {
      return { isAuth: false };
    }

    return {
      isAuth: true,
      userId: payload.userId,
      role: payload.role,
    };
  } catch (error) {
    console.log("Auth error:", error);
    return { isAuth: false };
  }
};