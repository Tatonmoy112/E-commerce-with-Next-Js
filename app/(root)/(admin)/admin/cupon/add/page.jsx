"use client";
import BreadCrumb from "@/components/Application/admin/BreadCrumb";
import { ADMIN_CUPON_SHOW, ADMIN_DASHBOARD,  } from "@/routes/AdminPanelRoute";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ButtonLoading } from "@/components/Application/ButtonLoading";
import { zschema } from "@/lib/ZodSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { showToast } from "@/lib/showtoast";
import axios from "axios";


const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: "Home" },
  { href: ADMIN_CUPON_SHOW, label: "Cupon" },
  { href: "", label: "Add Cupon" },
];

const formSchema = zschema.pick({
  code: true,
  discountPercentage: true,
  minimumShoppingAmount: true,
  validity: true,
});

const AddCupon = () => {
  const [loading, setLoading] = useState(false);



  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
     code: "",
     discountPercentage: "",
     minimumShoppingAmount: "",
     validity:""
    },
  });



  const onSubmit = async (values) => {
    try {
      setLoading(true);

      const { data } = await axios.post("/api/cupon/create", values);
      if (!data.success) {
        // Backend might respond with 401 (email not verified) or 404 (invalid credentials)
        throw new Error(data.message);
      }
      // ✅ Show success toast
      form.reset();
      showToast("success", data.message);
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message || error.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };




  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />
      <Card className="py-0 rounded shadow-sm">
        <CardHeader className="pt-3 py-2 px-3 border-b [.border-b]:py-2 ">
          <h4 className="text-xl font-semibold">Add Cupon</h4>
        </CardHeader>
        <CardContent className="pb-5">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid md:grid-cols-2 grid-cols-1 gap-5"
            >
              <div className="">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel>
                        Code <span className="text-red-500">*</span>{" "}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Enter code"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="">
                <FormField
                  control={form.control}
                  name="discountPercentage"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel>
                        Discount Percentage{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter Discount Percentage"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="">
                <FormField
                  control={form.control}
                  name="minimumShoppingAmount"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel>
                       Minimum Shopping Amount  <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter minimum shopping amont"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="">
                <FormField
                  control={form.control}
                  name="validity"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel>
                        Validity Date <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
      
              
              <div className="mb-3 mt-5">
                <ButtonLoading
                  loading={loading}
                  type="submit"
                  text="Add Cupon"
                  className=""
                />
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddCupon;
