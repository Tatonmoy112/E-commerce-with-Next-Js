'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Card, CardContent } from '@/components/ui/card'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ButtonLoading } from '@/components/Application/ButtonLoading'
import { showToast } from '@/lib/showtoast'
import { USER_DASHBOARD, WEBSITE_REGISTER, WEBSITE_RESETPASSWORD } from '@/routes/WebsiteRoute'

import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa'
import Logo from '@/public/assets/images/logo-black.png'
import axios from 'axios'
import OTPVerification from '@/components/Application/OTPVerification'
import { useDispatch } from 'react-redux'
import { login } from '@/store/reducer/authReducer'
import { useRouter, useSearchParams } from 'next/navigation'
import { ADMIN_DASHBOARD } from '@/routes/AdminPanelRoute'

// ✅ Zod validation schema
const formSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(3, "Password is required")
})

const LoginPage = () => {
  const dispatch = useDispatch()
  const searchParams= useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [otpVerificationloading, setOtpVerificationLoading] = useState(false)
  const [isTypePassword, setIsTypePassword] = useState(true)
  const [otpEmail,setOtpemail] = useState()
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })
  const handleOtpVerification =async (values) => {
    try {
      setOtpVerificationLoading(true)
      const { data } = await axios.post('/api/auth/verify-otp', values)
      if (!data.success) {
        // Backend might respond with 401 (email not verified) or 404 (invalid credentials)
        throw new Error(data.message)
      }
      // ✅ Reset form
      form.reset()
      // ✅ Show success toast
      showToast("success", data.message)
      setOtpemail("")
      dispatch(login(data.data))
      if (searchParams.has('callback')){
        router.push(searchParams.get('callback'))
      }else{
        data.data.role === 'admin' ? router.push(ADMIN_DASHBOARD) : router.push(USER_DASHBOARD)
      }     
    } catch (error) {
      showToast("error", error.response?.data?.message || error.message || "Something went wrong")
    } finally {
      setOtpVerificationLoading(false)
    }    
  }
  const handleLoginSubmit = async (values) => {
    try {
      setLoading(true)
      const { data } = await axios.post('/api/auth/login', values)
      if (!data.success) {
        // Backend might respond with 401 (email not verified) or 404 (invalid credentials)
        throw new Error(data.message)
      }
      // ✅ Reset form
      form.reset()
      // ✅ Show success toast
      showToast("success", data.message)
      setOtpemail(values.email)
      // ✅ Redirect to OTP verification page
      if (data.email) {
        window.location.href = `/auth/verify-otp?email=${data.email}`
      }

    } catch (error) {
      showToast("error", error.response?.data?.message || error.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center  ">
      <Card className="w-[400px] ">
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
          {
            !otpEmail ?
            <>
             <div className="text-center mb-5">
            <h1 className="text-3xl font-bold">Log Into Account</h1>
            <p>Log into your account with email and password</p>
          </div>
          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleLoginSubmit)}>
              {/* Email */}
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
              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="mb-5 relative">
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type={isTypePassword ? 'password' : 'text'}
                        placeholder="********"
                        {...field}
                      />
                    </FormControl>
                    <button
                      type="button"
                      className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer"
                      onClick={() => setIsTypePassword(!isTypePassword)}
                    >
                      {isTypePassword ? <FaRegEyeSlash /> : <FaRegEye />}
                    </button>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Submit */}
              <div className="mb-3">
                <ButtonLoading loading={loading} type="submit" text="Login" className="w-full" />
              </div>
              {/* Links */}
              <div className="text-center mt-4">
                <div className="flex justify-center items-center gap-1">
                  <p>Don't have an account?</p>
                  <Link href={WEBSITE_REGISTER} className="text-primary underline">
                    Create Account
                  </Link>
                </div>
                <div className="mt-3">
                  <Link href={WEBSITE_RESETPASSWORD} className="text-primary underline">
                    Forgot Password?
                  </Link>
                </div>
              </div>
            </form>
          </Form>
            </>
            :
            <>
              <OTPVerification email={otpEmail} loading={otpVerificationloading} onSubmit={handleOtpVerification} />
            </>
          }
          {/* Heading */}
         
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginPage
