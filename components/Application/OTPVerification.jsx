import { zschema } from "@/lib/ZodSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { ButtonLoading } from "./ButtonLoading";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { showToast } from "@/lib/showtoast";
import axios from "axios";

const OTPVerification = ({ email, onSubmit, loading }) => {
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const formSchema = zschema.pick({
    otp: true,
    email: true,
  });
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: "",
      email: email,
    },
  });
  const handleOtpVerification = async (values) => {
    onSubmit(values);
  };
  const resendOTP = async () => {
    try {
      setIsResendingOtp(true);
      const { data } = await axios.post("/api/auth/resend-otp", { email });
      if (!data.success) {
        // Backend might respond with 401 (email not verified) or 404 (invalid credentials)
        throw new Error(data.message);
      }
      // ✅ Show success toast
      showToast("success", data.message);
      // ✅ Redirect to OTP verification page
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message || error.message || "Something went wrong"
      );
    } finally {
      setIsResendingOtp(false);
    }
  };
  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleOtpVerification)}>
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">
              Please Complete Verification
            </h1>
            <p className="text-md">
              Check Your e-mail for otp we have sent to you
            </p>
          </div>
          {/* OTP */}
          <div className="mb-3"></div>
          <FormField
            control={form.control}
            name="otp"
            className=""
            render={({ field }) => (
              <FormItem className="mb-5 relative   ">
                <FormLabel className="block text-center text-lg font-semibold">
                  Enter OTP
                </FormLabel>
                <FormControl>
                  <div className="flex justify-center">
                    {" "}
                    {/* ✅ centers horizontally */}
                    <InputOTP
                      maxLength={6}
                      value={field.value}
                      onChange={field.onChange}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </FormControl>
                <div className="flex justify-center">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          {/* Submit */}
          <div className="mb-3">
            <ButtonLoading
              loading={loading}
              type="submit"
              text="Verify"
              className="w-full"
            />
            <div className="text-center mt-5">
              <button
                onClick={resendOTP}
                type="button"
                className="text-blue-500 cursor-pointer hover:underline"
              >
                Resend OTP
              </button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};
export default OTPVerification;
