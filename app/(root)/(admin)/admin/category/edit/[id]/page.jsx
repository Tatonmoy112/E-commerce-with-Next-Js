'use client'
import BreadCrumb from '@/components/Application/admin/BreadCrumb';
import { ADMIN_CATEGORY_SHOW, ADMIN_DASHBOARD } from '@/routes/AdminPanelRoute';
import React, { use, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ButtonLoading } from '@/components/Application/ButtonLoading';
import { zschema } from '@/lib/ZodSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import slugify from 'slugify';
import { showToast } from '@/lib/showtoast';
import axios from 'axios';
import useFetch from '@/hooks/useFetch';

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: "Home" },
  { href: ADMIN_CATEGORY_SHOW, label: "Category" },
  { href: "", label: "Edit Category" },
];

const formSchema = zschema.pick({
  name: true,
  slug: true,
});

const EditCategory = ({ params }) => {
  const { id } = use(params);
  const { data: categoryData, isLoading: isFetching } = useFetch(`/api/category/get/${id}`);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      slug: '',
    },
  });

  // Watch the 'name' field to auto-generate slug
  const nameValue = useWatch({ control: form.control, name: 'name' });

  useEffect(() => {
    if (nameValue) {
      form.setValue('slug', slugify(nameValue).toLowerCase());
    }
  }, [nameValue]);

  // Reset form with fetched category data
  useEffect(() => {
    if (categoryData && categoryData.success) {
      const data = categoryData.data;
      form.reset({
        name: data.name || '',
        slug: data.slug || '',
      });
    }
  }, [categoryData]);

  const onSubmit = async (values) => {
    try {
      setLoading(true);
      const { data } = await axios.put('/api/category/update', { ...values, _id: id });
      if (!data.success) throw new Error(data.message);
      showToast('success', data.message);
    } catch (error) {
      showToast('error', error.response?.data?.message || error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (isFetching) return <p>Loading category...</p>;

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />
      <Card className="py-0 rounded shadow-sm">
        <CardHeader className="pt-3 py-2 px-3 border-b">
          <h4 className="text-xl font-semibold">Edit Category</h4>
        </CardHeader>
        <CardContent className="pb-5">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="mb-5">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem className="mb-5">
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Slug" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="mb-3">
                <ButtonLoading loading={loading} type="submit" text="Update Category" />
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditCategory;
