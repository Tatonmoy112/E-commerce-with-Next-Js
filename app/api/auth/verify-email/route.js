// app/api/auth/verify-email/route.js
import { connectDB } from "@/lib/db";
import UserModel from "@/models/User.model";
// import User from "@/models/User.model";
import { jwtVerify } from "jose";

export async function GET(req) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) throw new Error("Invalid token!");

    const secret = new TextEncoder().encode(process.env.SECRET_KEY);
    const decoded = await jwtVerify(token, secret);
    const userId = decoded.payload.userId;

    const user = await UserModel.findById(userId);
    if (!user) throw new Error("User not found!");

    if (!user.isEmailVerified) {
      user.isEmailVerified = true;
      await user.save();
    }

    // ✅ Return HTML with SweetAlert
    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>Email Verification</title>
          <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
        </head>
        <body>
          <script>
            Swal.fire({
              icon: 'success',
              title: 'Email Verified!',
              text: 'Your email has been successfully verified.',
              confirmButtonText: 'Go to Login'
            }).then(() => {
              window.location.href = '/auth/login';
            });
          </script>
        </body>
      </html>
    `;

    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (err) {
    console.error(err);

    const errorHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>Email Verification Error</title>
          <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
        </head>
        <body>
          <script>
            Swal.fire({
              icon: 'error',
              title: 'Verification Failed!',
              text: '${err.message}',
              confirmButtonText: 'Go to Login'
            }).then(() => {
              window.location.href = '/auth/login';
            });
          </script>
        </body>
      </html>
    `;

    return new Response(errorHtml, {
      headers: { "Content-Type": "text/html" },
    });
  }
}
