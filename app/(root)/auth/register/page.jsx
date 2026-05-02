'use client'
import { Card, CardContent } from '@/components/ui/card'
import React, { useState } from 'react'
import Logo from '@/public/assets/images/logo-black.png'
import Image from 'next/image'
import { zodResolver } from "@hookform/resolvers/zod"
import { zschema } from '@/lib/ZodSchema'
// import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useForm } from 'react-hook-form'
import { ButtonLoading } from '@/components/Application/ButtonLoading'
import {z} from 'zod'
import { FaRegEyeSlash } from "react-icons/fa"
import { FaRegEye } from "react-icons/fa";
import Link from 'next/link'
import { WEBSITE_LOGIN } from '@/routes/WebsiteRoute'
import axios from 'axios'
import { showToast } from '@/lib/showtoast'

const RegisterPage = () => {

    const [loading,setLoading] = useState(false)
    const [isTypePassword,setisTypePassword] = useState(true)

    const formSchema = zschema.pick({
       name:true, email: true, password: true,
    }).extend({
      confirmPassword: z.string(),
    }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // shows error on confirmPassword field
  });


    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name:"",
            email:"",
            password:"",
            confirmPassword:"",            
    },

  })

     const handleRegisterSubmit = async (values) => {
        try {
          setLoading(true);

          const { data } = await axios.post('/api/auth/register', values); // data is your API response

          if (!data.success) {
            throw new Error(data.message); // throw error if API returns success: false
          }

          form.reset();
          showToast("success", data.message); // use the response message

        } catch (error) {
          // show the error message properly
          showToast("error", error?.message || "Something went wrong");
        } finally {
          setLoading(false);
        }
};

  return (
    <Card className='w-[400px]'>
        <CardContent>
            <div className='flex justify-center'>
                <Image src={Logo.src} width={Logo.width} height={Logo.height}  alt='logo' className='max-w-[130px]'/>
            </div>
            <div className='text-center'>
                <h1 className='text-3xl font-bold'>Create Account</h1>
                <p>Create account with email and password</p>

            </div>
            

            <div className='mt-5'>
                <Form {...form}>
      <form onSubmit={form.handleSubmit(handleRegisterSubmit)} >
        <div className='mb-5'>
            <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input type='text' placeholder="full name" {...field} />
              </FormControl>
              
              <FormMessage />
            </FormItem>
          )}
        />
        </div>
        <div className='mb-5'>
            <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type='email' placeholder="example@gmail.com" {...field} />
              </FormControl>
              
              <FormMessage />
            </FormItem>
          )}
        />
        </div>
        <div className='mb-5'>
            <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type={isTypePassword  ? 'password' : "text"} placeholder="********" {...field} />
                
              </FormControl>
              <button className='absolute top-1/2 right-2 cursor-pointer '  type='button' onClick={()=> setisTypePassword(!isTypePassword) }>
                    {isTypePassword ? <FaRegEyeSlash/> : <FaRegEye/>}
                </button>
              
              <FormMessage />
            </FormItem>
          )}
        />
        </div>
        <div className='mb-5'>
            <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type={isTypePassword  ? 'password' : "text"} placeholder="********" {...field} />
                
              </FormControl>
              <button className='absolute top-1/2 right-2 cursor-pointer '  type='button' onClick={()=> setisTypePassword(!isTypePassword) }>
                    {isTypePassword ? <FaRegEyeSlash/> : <FaRegEye/>}
                </button>
              
              <FormMessage />
            </FormItem>
          )}
        />
        </div>
        <div className='mb-3'>
            <ButtonLoading loading={loading} type="submit" text="Register" className='w-full cursor-pointer ' />
        </div>

        <div className='text-center'>
           <div className='flex justify-center items-center gap-1'>
             <p> Already have an account?</p>
            <Link href={WEBSITE_LOGIN} className='text-primary underline'> Login</Link>
           </div>
           {/* <div className='mt-3'>
            <Link href='' className='text-primary underline'> Forgot Password?</Link>
           </div> */}

        </div>
       
      </form>
    </Form>
            </div>

        </CardContent>
    </Card>
  )
}

export default RegisterPage
