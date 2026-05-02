'use client'
import BreadCrumb from '@/components/Application/admin/BreadCrumb';
import { ADMIN_CATEGORY_SHOW, ADMIN_DASHBOARD } from '@/routes/AdminPanelRoute';
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ButtonLoading } from '@/components/Application/ButtonLoading';
import { zschema } from '@/lib/ZodSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import slugify from 'slugify';
import { showToast } from '@/lib/showtoast';
import axios from 'axios';

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: "Home" },
  { href: ADMIN_CATEGORY_SHOW, label: "Category" },
  { href: "", label: "Add Category" },
];

const formSchema = zschema.pick({
  name:true,
  slug: true,
})

const AddCategory = () => {
    const [loading,setLoading] = useState(false)

      const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
         name: '',
         slug: '',
        },
      })

const onSubmit = async (values) => {
    try {
      setLoading(true)
      const { data } = await axios.post('/api/category/create', values)
      if (!data.success) {
        // Backend might respond with 401 (email not verified) or 404 (invalid credentials)
        throw new Error(data.message)
      }
      // ✅ Show success toast
      form.reset()
      showToast("success", data.message)
    } catch (error) {
      showToast("error", error.response?.data?.message || error.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  } 
  
useEffect(()=>{
  const name = form.getValues('name')
  if(name){
    form.setValue('slug', slugify(name).toLowerCase() )
  }
},[form.watch('name')])

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData}  />
       <Card className="py-0 rounded shadow-sm">
        <CardHeader className="pt-3 py-2 px-3 border-b [.border-b]:py-2 ">
         <h4 className='text-xl font-semibold'>Add Category</h4>
        </CardHeader>
        <CardContent className='pb-5'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className='mb-5'>
                <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="mb-5">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Enter Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>
              <div className='mb-5'>
                <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem className="mb-5">
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Enter slug" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>
              <div className="mb-3">
                <ButtonLoading loading={loading} type="submit" text="Add Category" className="" />
              </div>         
            </form>
          </Form>
        </CardContent>
      </Card>     
    </div>
  )
}

export default AddCategory
