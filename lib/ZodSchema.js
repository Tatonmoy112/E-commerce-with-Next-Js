import { z } from "zod";

export const zschema = z.object({
  name: z
    .string()
    .min(4, { message: "Name must be at least 4 characters long" })
    .max(50, { message: "Name cannot exceed 50 characters" })
    ,

  email: z
    .string()
    .email({ message: "Invalid email address" })
    .min(5, { message: "Email must be at least 5 characters long" }),

  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter",
    })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[@$!%*?&]/, {
      message: "Password must contain at least one special character (@$!%*?&)",
    }),
  confirmPassword: z.string(),

  otp: z.string().regex(/^\d{6}$/, "OTP must be exactly 6 digits"),

  _id: z.string().min(3, "_id is required"),
  alt: z.string().min(3, "Alt is required"),
  title: z.string().min(3, "Title is required"),
  slug: z.string().min(3, "Slug is required"),
  category: z.string().min(3, "Category is required"),
  mrp: z.union([
    z.number().positive("Expected positive value, received negative"),
    z.string().transform((val)=> Number(val)).refine((val)=>!isNaN(val) && val >=0,"Please enter a valid number")
  ]),
  sellingPrice: z.union([
    z.number().positive("Expected positive value, received negative"),
    z.string().transform((val)=> Number(val)).refine((val)=>!isNaN(val) && val >=0,"Please enter a valid number")
  ]),
  discountPercentage: z.union([
    z.number().positive("Expected positive value, received negative"),
    z.string().transform((val)=> Number(val)).refine((val)=>!isNaN(val) && val >=0,"Please enter a valid number")
  ]),
description: z.string().min(3, "Description is required"),
media: z.array(z.string()),
 product: z.string().min(3, { message: "Product is required" }),
  sku:     z.string().min(3, { message: "SKU is required" }),
  color:   z.string().min(3, { message: "Color is required" }),
  size:   z.string().min(1, { message: "Size is required" }),
  code:   z.string().min(3, { message: "Color is required" }),
  minimumShoppingAmount: z.union([
    z.number().positive("Expected positive value, received negative"),
    z.string().transform((val)=> Number(val)).refine((val)=>!isNaN(val) && val >=0,"Please enter a valid number")
  ]),
  validity:z.coerce.date(),

});
