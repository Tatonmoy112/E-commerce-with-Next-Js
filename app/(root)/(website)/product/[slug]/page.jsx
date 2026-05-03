'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import WebsiteBreadCrumb from '@/components/Application/Website/WebsiteBreadCrumb'
import { ButtonLoading } from '@/components/Application/ButtonLoading'
import imgPlaceholder from '@/public/assets/images/img-placeholder.webp'
import { Star } from 'lucide-react'
import { toast } from 'react-hot-toast'

const ProductDetail = () => {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewData, setReviewData] = useState({ rating: 5, title: '', review: '' })

  const fetchProduct = async () => {
    console.log("Frontend fetching product for slug:", slug)
    try {
      const { data } = await axios.get(`/api/product/${slug}`)
      if (data.success) {
        setProduct(data.data)
      } else {
        setError(data.message || "Product not found")
      }
    } catch (err) {
      console.error("Error fetching product", err)
      setError(err.response?.data?.message || "Something went wrong while fetching the product")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (slug) fetchProduct()
  }, [slug])

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    setSubmittingReview(true)
    try {
      const { data } = await axios.post('/api/review', {
        productId: product.id,
        ...reviewData
      })
      if (data.success) {
        toast.success("Review submitted!")
        setReviewData({ rating: 5, title: '', review: '' })
        fetchProduct() // Refresh to show new review
      } else {
        toast.error(data.message || "Failed to submit review")
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login to provide a review")
    } finally {
      setSubmittingReview(false)
    }
  }

  const breadcrumb = product ? {
    title: product.name,
    links: [
      { label: product.category?.name || "Category", href: `/shop?category=${product.category?.slug}` },
      { label: product.name, href: "" },
    ],
  } : null

  if (loading) return <div className="h-screen flex items-center justify-center">Loading product...</div>
  if (!product) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
      <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md">
        <h1 className="text-4xl font-bold text-red-500 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{error || "Product Not Found"}</h2>
        <p className="text-gray-500 mb-8">We couldn't find the product with slug: <span className="font-mono font-bold text-black">{slug}</span></p>
        <div className="flex gap-4 justify-center">
            <button onClick={() => window.location.reload()} className="bg-primary text-white px-6 py-2 rounded-xl hover:bg-black transition-all">Reload Page</button>
            <Link href="/shop" className="border border-gray-300 px-6 py-2 rounded-xl hover:bg-gray-50 transition-all">Back to Shop</Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="bg-white min-h-screen">
      {/* Premium Breadcrumb to match screenshot */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-2 text-sm text-gray-500">
           <Link href="/" className="hover:text-primary transition-colors">Home</Link>
           <span>&gt;</span>
           <Link href={`/shop?category=${product.category?.slug}`} className="hover:text-primary transition-colors">{product.category?.name}</Link>
           <span>&gt;</span>
           <span className="text-black font-medium">{product.name}</span>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-16 lg:flex gap-16">
        {/* LEFT: IMAGE */}
        <div className="lg:w-1/2">
          <div className="rounded-2xl overflow-hidden border">
            <Image 
              src={product.media?.[0]?.secure_url || imgPlaceholder.src}
              alt={product.name}
              width={800}
              height={800}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

        {/* RIGHT: INFO */}
        <div className="lg:w-1/2 mt-10 lg:mt-0">
          <h1 className="text-4xl font-bold text-gray-900">{product.name}</h1>
          <div className="mt-5 flex items-center gap-4">
             <span className="text-3xl font-bold text-primary">৳{product.sellingPrice}</span>
             <span className="text-xl text-gray-400 line-through">৳{product.mrp}</span>
             <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
               {product.discountPercentage}% OFF
             </span>
          </div>

          <p className="mt-8 text-gray-600 leading-relaxed">
            {product.description}
          </p>

          <div className="mt-10">
            <ButtonLoading text="Add to Cart" className="px-10 py-6 text-lg" />
          </div>
        </div>
      </div>

      {/* REVIEWS SECTION */}
      <div className="max-w-7xl mx-auto px-4 py-20 border-t">
        <h2 className="text-3xl font-bold mb-10">Ratings & Reviews</h2>
        
        <div className="lg:flex gap-20">
          {/* REVIEW FORM */}
          <div className="lg:w-1/3 mb-10 lg:mb-0">
            <div className="bg-gray-50 p-6 rounded-2xl sticky top-24">
              <h3 className="text-xl font-bold mb-4">Write a Review</h3>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rating</label>
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`w-6 h-6 cursor-pointer ${star <= reviewData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        onClick={() => setReviewData({...reviewData, rating: star})}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Review Title</label>
                  <input 
                    type="text" 
                    className="w-full mt-1 border rounded-lg p-2" 
                    placeholder="Summary of your experience"
                    value={reviewData.title}
                    onChange={(e) => setReviewData({...reviewData, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Your Review</label>
                  <textarea 
                    rows="4" 
                    className="w-full mt-1 border rounded-lg p-2" 
                    placeholder="Tell us more about the product"
                    required
                    value={reviewData.review}
                    onChange={(e) => setReviewData({...reviewData, review: e.target.value})}
                  ></textarea>
                </div>
                <ButtonLoading 
                  type="submit" 
                  loading={submittingReview} 
                  text="Submit Review" 
                  className="w-full"
                />
              </form>
            </div>
          </div>

          {/* REVIEWS LIST */}
          <div className="lg:w-2/3">
            {product.reviews?.length > 0 ? (
              <div className="space-y-8">
                {product.reviews.map((rev) => (
                  <div key={rev.id} className="border-b pb-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                          {rev.user?.name?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="font-bold">{rev.user?.name || 'Anonymous User'}</p>
                          <p className="text-xs text-gray-400">{new Date(rev.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < rev.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                    </div>
                    <h4 className="mt-4 font-bold text-lg">{rev.title}</h4>
                    <p className="mt-2 text-gray-600">{rev.review}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-50 rounded-2xl">
                <p className="text-gray-400 italic">No reviews yet. Be the first to review this product!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
