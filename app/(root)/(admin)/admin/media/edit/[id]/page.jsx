'use client'
import BreadCrumb from '@/components/Application/admin/BreadCrumb';
import { ButtonLoading } from '@/components/Application/ButtonLoading';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import useFetch from '@/hooks/useFetch'
import { zschema } from '@/lib/ZodSchema';
import { ADMIN_DASHBOARD, ADMIN_MEDIA_SHOW } from '@/routes/AdminPanelRoute';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import React, { use, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import imgPlaceholder from '@/public/assets/images/img-placeholder.webp'
import axios from 'axios';
import { showToast } from '@/lib/showtoast';


const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: "Home" },
  { href: ADMIN_MEDIA_SHOW, label: "Media" },
  { href: "", label: "Edit Media" },
];

const formSchema = zschema.pick({
  _id:true,
  alt: true,
  title:true
})



const EditMedia = ({params}) => {
  const {id} = use(params)
  const {data : mediaData} = useFetch(`/api/media/get/${id}`)
  const [loading,setLoading] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
     _id: '',
     alt: '',
     title: '',
    },
  })

  useEffect(()=>{
    if(mediaData && mediaData.success){
      const data = mediaData.data
      form.reset({
        _id:data._id,
        alt : data.alt,
        title: data.title
      })
    }
  }, [mediaData])

   const onSubmit = async (values) => {
    try {
      setLoading(true)
      const { data } = await axios.put ('/api/media/update', values)
      if (!data.success) {
        // Backend might respond with 401 (email not verified) or 404 (invalid credentials)
        throw new Error(data.message)
      }
      // ✅ Show success toast
      showToast("success", data.message)
    } catch (error) {
      showToast("error", error.response?.data?.message || error.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData}/>
       <Card className="py-0 rounded shadow-sm">
        <CardHeader className="pt-3 py-2 px-3 border-b [.border-b]:py-2 ">
         <h4 className='text-xl font-semibold'>Edit Media</h4>
        </CardHeader>
        <CardContent className='pb-5'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className='mb-5'>
                   <Image src={mediaData?.data?.secure_url || imgPlaceholder} alt={mediaData?.data?.alt || 'Image'} width={150} height={150} />
              </div>
              <div className='mb-5'>
                <FormField
                control={form.control}
                name="alt"
                render={({ field }) => (
                  <FormItem className="mb-5">
                    <FormLabel>Alt</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Enter alt" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>
              <div className='mb-5'>
                <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="mb-5">
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Enter title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>
              <div className="mb-3">
                <ButtonLoading loading={loading} type="submit" text="Update Media" className="" />
              </div>         
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export default EditMedia
