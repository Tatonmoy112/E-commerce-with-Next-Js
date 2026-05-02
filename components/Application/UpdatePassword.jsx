"use client";
import { Card, CardContent } from "@/components/ui/card";
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { zschema } from "@/lib/ZodSchema";
// import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { ButtonLoading } from "@/components/Application/ButtonLoading";
import { z } from "zod";
import { FaRegEyeSlash } from "react-icons/fa";
import { FaRegEye } from "react-icons/fa";
import axios from "axios";
import { showToast } from "@/lib/showtoast";
import { useRouter } from "next/navigation";
import { WEBSITE_LOGIN } from "@/routes/WebsiteRoute";
const UpdatePassword = ({ email }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isTypePassword, setisTypePassword] = useState(true);
  const formSchema = zschema
    .pick({
      email: true,
      password: true,
    })
    .extend({
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"], // shows error on confirmPassword field
    });
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: email,
      password: "",
      confirmPassword: "",
    },
  });
  const handlePasswordUpdate = async (values) => {
    try {
      setLoading(true);
      const { data } = await axios.put(
        "/api/auth/reset-password/update-password",
        values
      ); // data is your API response
      if (!data.success) {
        throw new Error(data.message); // throw error if API returns success: false
      }
      form.reset();
      showToast("success", data.message); // use the response message
      router.push(WEBSITE_LOGIN);
    } catch (error) {
      // show the error message properly
      showToast("error", error?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <div className="text-center">
        <h1 className="text-3xl font-bold">Update Password</h1>
        <p>Enter Your New Password </p>
      </div>
      <div className="mt-5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handlePasswordUpdate)}>
            <div className="mb-5">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type={isTypePassword ? "password" : "text"}
                        placeholder="********"
                        {...field}
                      />
                    </FormControl>
                    <button
                      className="absolute top-1/2 right-2 cursor-pointer "
                      type="button"
                      onClick={() => setisTypePassword(!isTypePassword)}
                    >
                      {isTypePassword ? <FaRegEyeSlash /> : <FaRegEye />}
                    </button>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="mb-5">
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type={isTypePassword ? "password" : "text"}
                        placeholder="********"
                        {...field}
                      />
                    </FormControl>
                    <button
                      className="absolute top-1/2 right-2 cursor-pointer "
                      type="button"
                      onClick={() => setisTypePassword(!isTypePassword)}
                    >
                      {isTypePassword ? <FaRegEyeSlash /> : <FaRegEye />}
                    </button>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="mb-3">
              <ButtonLoading
                loading={loading}
                type="submit"
                text="Update Password"
                className="w-full cursor-pointer "
              />
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
export default UpdatePassword;
