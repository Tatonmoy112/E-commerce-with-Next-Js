'use client'
import React, { useEffect, useState } from 'react';
import BreadCrumb from '@/components/Application/admin/BreadCrumb';
import { ADMIN_DASHBOARD, ADMIN_PRODUCT_SHOW } from '@/routes/AdminPanelRoute';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Select from '@/components/Application/Select';
import Editor from '@/components/Application/admin/Editor';
import MediaModal from '@/components/Application/admin/MediaModal';
import Image from 'next/image';
import axios from 'axios';
import useFetch from '@/hooks/useFetch';
import slugify from 'slugify';
import { showToast } from '@/lib/showtoast';

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_PRODUCT_SHOW, label: 'Product' },
  { href: '', label: 'Edit Product' },
];

const EditProduct = ({ id }) => {
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState({
    name: '',
    slug: '',
    category: '',
    mrp: 0,
    sellingPrice: 0,
    discountPercentage: 0,
    description: '',
    media: [],
  });
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [openMediaModal, setOpenMediaModal] = useState(false);
  const [initialDescription, setInitialDescription] = useState('');


  // Fetch categories
  const { data: categoryData, isLoading: loadingCategories } = useFetch(
    '/api/category?deleteType=SD&start=0&size=100'
  );

  // Fetch product
  const { data: productData, isLoading: loadingProduct } = useFetch(
    `/api/product/get/${id}`
  );

  // Set categories
  useEffect(() => {
    if (categoryData?.success) {
      const options = categoryData.data.map(cat => ({
        label: cat.name,
        value: String(cat._id),
      }));
      setCategoryOptions(options);
    }
  }, [categoryData]);

  // Set product data
  useEffect(() => {
    if (productData?.success && categoryOptions.length > 0) {
      const p = productData.data;
      setProduct({
        name: p.name || '',
        slug: p.slug || '',
        category: String(p.category?._id) || '',
        mrp: p.mrp || 0,
        sellingPrice: p.sellingPrice || 0,
        discountPercentage: p.discountPercentage || 0,
        description: p.description || '',
        media: p.media || [],
      });
      setSelectedMedia(p.media || []);
      setInitialDescription(p.description || '');
    }
  }, [productData, categoryOptions]);

  // Auto-generate slug
  useEffect(() => {
    if (product.name) {
      setProduct(prev => ({ ...prev, slug: slugify(prev.name).toLowerCase() }));
    }
  }, [product.name]);

  // Auto-calculate discount
  useEffect(() => {
    const { mrp, sellingPrice } = product;
    const discount =
      mrp > 0 && sellingPrice > 0
        ? Math.round(((mrp - sellingPrice) / mrp) * 100)
        : 0;
    setProduct(prev => ({ ...prev, discountPercentage: discount }));
  }, [product.mrp, product.sellingPrice]);

  const handleChange = e => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleEditorChange = (event, editor) => {
    const data = editor.getData();
    setProduct(prev => ({ ...prev, description: data }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = { ...product, media: selectedMedia.map(m => m._id), _id: id };

      const { data } = await axios.put('/api/product/update', payload);
      if (!data.success) throw new Error(data.message);

      showToast('success', data.message);
    } catch (err) {
      showToast(
        'error',
        err.response?.data?.message || err.message || 'Something went wrong'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingProduct || loadingCategories) return <p>Loading...</p>;

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <Card className="py-0 rounded shadow-sm">
        <CardHeader className="pt-3 py-2 px-3 border-b">
          <h4 className="text-xl font-semibold">Edit Product</h4>
        </CardHeader>
        <CardContent className="pb-5">
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 grid-cols-1 gap-5">
            {/* Name */}
            <div>
              <label className="block font-medium mb-1">Name <span className="text-red-500">*</span></label>
              <input
                name="name"
                value={product.name}
                onChange={handleChange}
                className="border w-full p-2 rounded"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block font-medium mb-1">Slug <span className="text-red-500">*</span></label>
              <input
                name="slug"
                value={product.slug}
                onChange={handleChange}
                className="border w-full p-2 rounded"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block font-medium mb-1">Category <span className="text-red-500">*</span></label>
              <Select
                options={categoryOptions}
                selected={product.category}
                setSelected={val => setProduct(prev => ({ ...prev, category: val }))}
                isMulti={false}
              />
            </div>

            {/* MRP */}
            <div>
              <label className="block font-medium mb-1">MRP <span className="text-red-500">*</span></label>
              <input
                type="number"
                name="mrp"
                value={product.mrp}
                onChange={handleChange}
                className="border w-full p-2 rounded"
              />
            </div>

            {/* Selling Price */}
            <div>
              <label className="block font-medium mb-1">Selling Price <span className="text-red-500">*</span></label>
              <input
                type="number"
                name="sellingPrice"
                value={product.sellingPrice}
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
                value={product.discountPercentage}
                readOnly
                className="border w-full p-2 rounded "
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block  font-medium mb-1">Description <span className="text-red-500">*</span></label>
              <Editor key={initialDescription}  initialData={product.description} onChange={handleEditorChange} />
            </div>

            {/* Media */}
            <div className="md:col-span-2 border-dashed border rounded p-5 text-center">
              {selectedMedia.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mb-3">
                  {selectedMedia.map(media => (
                    <div key={media._id} className="border p-1 rounded">
                      <Image
                        src={media.secure_url || media.path}
                        alt={media.name || 'media'}
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
                className="border  w-[200px] mx-auto p-5 cursor-pointer"
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
                {loading ? 'Updating...' : 'Update Product'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProduct;
