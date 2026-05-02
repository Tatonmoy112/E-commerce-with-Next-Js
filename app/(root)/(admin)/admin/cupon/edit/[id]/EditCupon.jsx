'use client';
import React, { useEffect, useState } from 'react';
import BreadCrumb from '@/components/Application/admin/BreadCrumb';
import { ADMIN_DASHBOARD, ADMIN_CUPON_SHOW } from '@/routes/AdminPanelRoute';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ButtonLoading } from '@/components/Application/ButtonLoading';
import { zschema } from '@/lib/ZodSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { showToast } from '@/lib/showtoast';
import axios from 'axios';

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_CUPON_SHOW, label: 'Cupon' },
  { href: '', label: 'Edit Cupon' },
];

const formSchema = zschema.pick({
  code: true,
  discountPercentage: true,
  minimumShoppingAmount: true,
  validity: true,
});

const EditCupon = ({ id }) => {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
      discountPercentage: 0,
      minimumShoppingAmount: 0,
      validity: '',
    },
  });

  // Fetch cupon by ID and fill form
  useEffect(() => {
    const fetchCupon = async () => {
      try {
        const { data } = await axios.get(`/api/cupon/get/${id}`);
        if (!data.success) throw new Error(data.message);

        form.reset({
          code: data.data.code,
          discountPercentage: data.data.discountPercentage,
          minimumShoppingAmount: data.data.minimumShoppingAmount,
          validity: data.data.validity.split('T')[0], // format YYYY-MM-DD
        });
      } catch (error) {
        showToast(
          'error',
          error.response?.data?.message || error.message || 'Failed to fetch cupon'
        );
      }
    };

    if (id) fetchCupon();
  }, [id]);

  const onSubmit = async (values) => {
    try {
      setLoading(true);
      const payload = { _id: id, ...values };

      const { data } = await axios.put('/api/cupon/update', payload);
      if (!data.success) throw new Error(data.message);

      showToast('success', data.message);
    } catch (error) {
      showToast(
        'error',
        error.response?.data?.message || error.message || 'Failed to update cupon'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />
      <Card className="py-0 rounded shadow-sm">
        <CardHeader className="pt-3 py-2 px-3 border-b">
          <h4 className="text-xl font-semibold">Edit Cupon</h4>
        </CardHeader>
        <CardContent className="pb-5">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid md:grid-cols-2 grid-cols-1  gap-5"
            >
              {/* Code */}
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Code <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Discount Percentage */}
              <FormField
                control={form.control}
                name="discountPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Discount Percentage <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter discount" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Minimum Shopping Amount */}
              <FormField
                control={form.control}
                name="minimumShoppingAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Minimum Shopping Amount <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter minimum shopping amount"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Validity */}
              <FormField
                control={form.control}
                name="validity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Validity Date <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit */}
              <div className="md:col-span-2 mt-5">
                <ButtonLoading loading={loading} type="submit" text="Update Cupon" />
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditCupon;
