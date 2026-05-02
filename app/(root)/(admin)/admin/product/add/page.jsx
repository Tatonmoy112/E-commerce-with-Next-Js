"use client";
import BreadCrumb from "@/components/Application/admin/BreadCrumb";
import { ADMIN_DASHBOARD, ADMIN_PRODUCT_SHOW } from "@/routes/AdminPanelRoute";
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
import slugify from "slugify";
import { showToast } from "@/lib/showtoast";
import axios from "axios";
import useFetch from "@/hooks/useFetch";
import Select from "@/components/Application/Select";
import Editor from "@/components/Application/admin/Editor";
import MediaModal from "@/components/Application/admin/MediaModal";
import Image from "next/image";

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: "Home" },
  { href: ADMIN_PRODUCT_SHOW, label: "Product" },
  { href: "", label: "Add Product" },
];

const formSchema = zschema.pick({
  name: true,
  slug: true,
  category: true,
  mrp: true,
  sellingPrice: true,
  discountPercentage: true,
  media: true,
  description: true,
});

const AddProduct = () => {
  const [loading, setLoading] = useState(false);
  const { data: getCategory } = useFetch(
    "/api/category?deleteType=SD&&size=10000"
  );
  const [categoryOption, setCategoryOption] = useState([]);

  //   mdia mdoal states
  const [open, setOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState([]);

  useEffect(() => {
    if (getCategory && getCategory.success) {
      const data = getCategory.data;
      const options = data.map((cat) => ({
        label: cat.name,
        value: cat._id,
      }));
      setCategoryOption(options);
    }
  }, [getCategory]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      category: "",
      mrp: 0,
      sellingPrice: 0,
      discountPercentage: 0,
      media: [],
      description: "",
    },
  });

  const editor = (event, editor) => {
    const data = editor.getData();
    form.setValue("description", data);
  };

  const onSubmit = async (values) => {
    try {
      setLoading(true);
      if(!selectedMedia || selectedMedia.length === 0){
        setLoading(false); 
        return showToast('error',"Please select media")
      }
      const mediaIds= selectedMedia.map(media=>media._id)
      values.media= mediaIds
      const { data } = await axios.post("/api/product/create", values);
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

  useEffect(() => {
    const name = form.getValues("name");
    if (name) {
      form.setValue("slug", slugify(name).toLowerCase());
    }
  }, [form.watch("name")]);

  // discount percentage calculation
 useEffect(() => {
  const mrp = Number(form.getValues("mrp")) || 0;
  const sellingPrice = Number(form.getValues("sellingPrice")) || 0;

  if (mrp > 0 && sellingPrice > 0) {
    const discount = Math.round(((mrp - sellingPrice) / mrp) * 100);
    form.setValue("discountPercentage", discount);
  } else {
    form.setValue("discountPercentage", 0);
  }
}, [form.watch("mrp"), form.watch("sellingPrice")]);


  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />
      <Card className="py-0 rounded shadow-sm">
        <CardHeader className="pt-3 py-2 px-3 border-b [.border-b]:py-2 ">
          <h4 className="text-xl font-semibold">Add Product</h4>
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
                  name="name"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel>
                        Name <span className="text-red-500">*</span>{" "}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Enter Name"
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
                  name="slug"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel>
                        Slug <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Enter slug"
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
                  name="category"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel>
                        Category <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          options={categoryOption}
                          selected={field.value}
                          setSelected={field.onChange}
                          isMulti={false}
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
                  name="mrp"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel>
                        MRP <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter MRP"
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
                  name="sellingPrice"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel>
                        Selling Price <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter Selling Price"
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
                          readOnly
                          placeholder="Enter Discount Percentage"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="mb-5 md:col-span-2">
                <FormLabel className="mb-2">
                  Description <span className="text-red-500">*</span>
                </FormLabel>
                <Editor onChange={editor} />
                <FormMessage />
              </div>
              <div className="md:col-span-2 border boder-dashed rounded p-5 text-center ">
                {/* Show Selected Media */}
                
                    {selectedMedia.length > 0 && (
                      <div className="flex justify-center items-center flex-wrap gap-2  mb-3 ">
                        {selectedMedia.map((media) => (
                          <div key={media._id} className="border p-1 rounded">
                            {media.secure_url || media.path ? (
                              <Image
                                src={
                                  media.secure_url ||
                                  media.url ||
                                  media.thumbnail_url ||
                                  media.path
                                }
                                alt={media.name || "media"}
                                width={80}
                                height={80}
                                className="h-20 w-20 object-cover rounded"
                              />
                            ) : (
                              <div className="h-20 w-20 bg-gray-200 flex items-center justify-center text-sm text-gray-500 rounded">
                                No Image
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  
                <MediaModal
                  open={open}
                  setOpen={setOpen}
                  selectedMedia={selectedMedia}
                  setSelectedMedia={setSelectedMedia}
                  isMultiple={true}
                />
                <div
                  onClick={() => setOpen(true)}
                  className="bg-gray-50 dark:bg-card border w-[200px] mx-auto p-5 cursor-pointer"
                >
                  <span className="font-semibold">Select Media </span>
                </div>
              </div>
              <div className="mb-3 mt-5">
                <ButtonLoading
                  loading={loading}
                  type="submit"
                  text="Add Product"
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

export default AddProduct;
