'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'

import { Card, CardContent } from '@/components/ui/card'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ButtonLoading } from '@/components/Application/ButtonLoading'
import { showToast } from '@/lib/showtoast'
import { WEBSITE_LOGIN } from '@/routes/WebsiteRoute'
import Logo from '@/public/assets/images/logo-black.png'
import { zschema } from '@/lib/ZodSchema'
import OTPVerification from '@/components/Application/OTPVerification'
import UpdatePassword from '@/components/Application/UpdatePassword'

const formSchema = zschema.pick({
  email: true,
})

const ResetPassword = () => {
  const [loading, setLoading] = useState(false)
  const [otpVerificationloading, setOtpVerificationLoading] = useState(false)
  const [otpEmail, setOtpemail] = useState("")
  const [isOtpVerified, setIsOtpVerified] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  })

  // ✅ Step 1 — Send OTP
  const handleEmailVerification = async (values) => {
    try {
      setLoading(true)
      const { data } = await axios.post('/api/auth/reset-password/send-otp', values)

      if (!data.success) throw new Error(data.message)

      showToast("success", data.message)
      setOtpemail(values.email)  // move to OTP step

    } catch (error) {
      showToast("error", error.response?.data?.message || error.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  // ✅ Step 2 — Verify OTP
  const handleOtpVerification = async (values) => {
    try {
      setOtpVerificationLoading(true)

      const { data } = await axios.post('/api/auth/reset-password/verify-otp', values)
      if (!data.success) throw new Error(data.message)

      showToast("success", data.message)
      setIsOtpVerified(true) // move to password update step

    } catch (error) {
      showToast("error", error.response?.data?.message || error.message || "Something went wrong")
    } finally {
      setOtpVerificationLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-[400px]">
        <CardContent>
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <Image 
              src={Logo.src} 
              width={Logo.width} 
              height={Logo.height} 
              alt="logo" 
              className="max-w-[130px]" 
            />
          </div>

          {/* Conditional Flow */}
          {!otpEmail ? (
            <>
              <div className="text-center mb-5">
                <h1 className="text-3xl font-bold">Reset Password</h1>
                <p>Enter your email to receive a reset code</p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleEmailVerification)}>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="mb-5">
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="example@gmail.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="mb-3">
                    <ButtonLoading loading={loading} type="submit" text="Send OTP" className="w-full" />
                  </div>

                  <div className="text-center mt-4">
                    <Link href={WEBSITE_LOGIN} className="text-primary underline">
                      Back to Login
                    </Link>
                  </div>
                </form>
              </Form>
            </>
          ) : !isOtpVerified ? (
            <OTPVerification
              email={otpEmail}
              loading={otpVerificationloading}
              onSubmit={handleOtpVerification}
            />
          ) : (
            <UpdatePassword email={otpEmail} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ResetPassword
