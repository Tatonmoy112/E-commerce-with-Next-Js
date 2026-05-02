"use client";

import React, { useEffect, useState } from "react";
import BreadCrumb from "@/components/Application/admin/BreadCrumb";
import {
  ADMIN_DASHBOARD,
  ADMIN_PRODUCT_VARIANT_SHOW,
} from "@/routes/AdminPanelRoute";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Select from "@/components/Application/Select";
import MediaModal from "@/components/Application/admin/MediaModal";
import Image from "next/image";
import axios from "axios";
import useFetch from "@/hooks/useFetch";
import { showToast } from "@/lib/showtoast";
import { sizes } from "@/lib/utils";

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: "Home" },
  { href: ADMIN_PRODUCT_VARIANT_SHOW, label: "Product Variant" },
  { href: "", label: "Edit Product Variant" },
];

const EditProductVariant = ({ id }) => {
  const [loading, setLoading] = useState(false);
  const [variant, setVariant] = useState({
    product: { _id: "", name: "" },
    size: "",
    color: "",
    sku: "",
    mrp: 0,
    sellingPrice: 0,
    discountPercentage: 0,
    media: [],
  });
  const [initialVariant, setInitialVariant] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [openMediaModal, setOpenMediaModal] = useState(false);

  // Fetch variant
  const { data: variantData, isLoading: loadingVariant } = useFetch(
    `/api/product-variant/get/${id}`
  );

  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get(
          "/api/product?deleteType=SD&&size=10000"
        );
        if (data.success) setAllProducts(data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, []);

  // Set variant and initialVariant for Editor and Media
  useEffect(() => {
    if (variantData?.success && allProducts.length > 0) {
      const v = variantData.data;
      const initial = {
        product: v.product || { _id: "", name: "" },
        size: v.size || "",
        color: v.color || "",
        sku: v.sku || "",
        mrp: v.mrp || 0,
        sellingPrice: v.sellingPrice || 0,
        discountPercentage: v.discountPercentage || 0,
        media: v.media || [],
      };
      setVariant(initial);
      setInitialVariant(initial);
      setSelectedMedia(v.media || []);
    }
  }, [variantData, allProducts]);

  // Auto-calc discount
  useEffect(() => {
    const { mrp, sellingPrice } = variant;
    const discount =
      mrp > 0 && sellingPrice > 0
        ? Math.round(((mrp - sellingPrice) / mrp) * 100)
        : 0;
    setVariant((prev) => ({ ...prev, discountPercentage: discount }));
  }, [variant.mrp, variant.sellingPrice]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVariant((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        ...variant,
        product: variant.product._id,
        media: selectedMedia.map((m) => m._id),
        _id: id,
      };
      const { data } = await axios.put("/api/product-variant/update", payload);
      if (!data.success) throw new Error(data.message);
      showToast("success", data.message);
    } catch (err) {
      showToast(
        "error",
        err.response?.data?.message || err.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingVariant) return <p>Loading...</p>;

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <Card className="py-0 rounded shadow-sm">
        <CardHeader className="pt-3 py-2 px-3 border-b">
          <h4 className="text-xl font-semibold">Edit Product Variant</h4>
        </CardHeader>

        <CardContent className="pb-5">
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 grid-cols-1  gap-5">
            {/* Product */}
            <div>
              <label className="block font-medium mb-1">
                Product <span className="text-red-500">*</span>
              </label>
              <Select
                options={allProducts.map((p) => ({
                  value: p._id,
                  label: p.name,
                }))}
                selected={variant.product._id || ""} // just value
                setSelected={(val) =>
                  setVariant((prev) => ({
                    ...prev,
                    product: allProducts.find((p) => p._id === val) || {
                      _id: "",
                      name: "",
                    },
                  }))
                }
                isMulti={false}
              />
            </div>

            {/* SKU */}
            <div>
              <label className="block font-medium mb-1">
                SKU <span className="text-red-500">*</span>
              </label>
              <input
                name="sku"
                value={variant.sku}
                onChange={handleChange}
                className="border w-full p-2 rounded"
              />
            </div>

            {/* Color */}
            <div>
              <label className="block font-medium mb-1">
                Color <span className="text-red-500">*</span>
              </label>
              <input
                name="color"
                value={variant.color}
                onChange={handleChange}
                className="border w-full p-2 rounded"
              />
            </div>

            {/* Size */}
            <div>
              <label className="block font-medium mb-1">
                Size <span className="text-red-500">*</span>
              </label>
              <Select
                options={sizes.map((s) => ({ value: s.value, label: s.label }))}
                selected={variant.size || ""} // just value
                setSelected={(val) =>
                  setVariant((prev) => ({ ...prev, size: val }))
                }
                isMulti={false}
              />
            </div>

            {/* MRP */}
            <div>
              <label className="block font-medium mb-1">
                MRP <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="mrp"
                value={variant.mrp}
                onChange={handleChange}
                className="border w-full p-2 rounded"
              />
            </div>

            {/* Selling Price */}
            <div>
              <label className="block font-medium mb-1">
                Selling Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="sellingPrice"
                value={variant.sellingPrice}
                onChange={handleChange}
                className="border w-full p-2 rounded"
              />
            </div>

            {/* Discount */}
            <div>
              <label className="block font-medium mb-1">Discount %</label>
              <input
                type="number"
                name="discountPercentage"
                value={variant.discountPercentage}
                readOnly
                className="border w-full p-2 rounded"
              />
            </div>

            {/* Media */}
            <div className="md:col-span-2 border-dashed border rounded p-5 text-center">
              {selectedMedia.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mb-3">
                  {selectedMedia.map((media) => (
                    <div key={media._id} className="border p-1 rounded">
                      <Image
                        src={media.secure_url || media.path}
                        alt={media.name || "media"}
                        width={80}
                        height={80}
                        className="h-20 w-20 object-cover rounded"
                      />
                    </div>
                  ))}
                </div>
              )}
              <MediaModal
                open={openMediaModal}
                setOpen={setOpenMediaModal}
                selectedMedia={selectedMedia}
                setSelectedMedia={setSelectedMedia}
                isMultiple
              />
              <div
                onClick={() => setOpenMediaModal(true)}
                className="border w-[200px] mx-auto p-5 cursor-pointer"
              >
                <span className="font-semibold">Select Media</span>
              </div>
            </div>

            {/* Submit */}
            <div className="md:col-span-2 mt-5">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                {loading ? "Updating..." : "Update Product Variant"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProductVariant;
