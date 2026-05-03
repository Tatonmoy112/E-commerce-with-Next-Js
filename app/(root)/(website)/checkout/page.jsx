'use client'
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { clearCart } from "@/store/reducer/cartReducer";
import { showToast } from "@/lib/showtoast";
import axios from "axios";
import WebsiteBreadCrumb from "@/components/Application/Website/WebsiteBreadCrumb";

const breadcrumb = {
  title: "Checkout",
  links: [
    { label: "Home", href: "/" },
    { label: "Cart", href: "/cart" },
    { label: "Checkout", href: "/checkout" },
  ],
};

const CheckoutPage = () => {
  const cart = useSelector((state) => state.cartStore);
  const auth = useSelector((state) => state.authStore);
  const dispatch = useDispatch();
  const router = useRouter();

  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect logic moved into useEffect to avoid setState during render
  useEffect(() => {
    if (cart.cartItems.length === 0) {
      router.push('/cart');
    } else if (!auth.auth) {
      showToast('error', 'Please login to checkout');
      router.push('/auth/login?redirect=/checkout');
    }
  }, [cart.cartItems, auth.auth, router]);

  // Show nothing while redirecting
  if (cart.cartItems.length === 0 || !auth.auth) {
    return null;
  }

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("/api/checkout", {
        cartItems: cart.cartItems,
        shippingAddress: address
      });

      if (response.data.success) {
        showToast('success', 'Order placed successfully!');
        dispatch(clearCart());
        router.push('/my-account/orders'); // Assuming an orders page exists
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <WebsiteBreadCrumb props={breadcrumb} />
      <div className="container mx-auto px-4 py-8 lg:px-32 lg:flex gap-8">
        
        {/* Checkout Form */}
        <div className="lg:w-2/3 bg-white p-6 rounded shadow-sm border">
          <h2 className="text-2xl font-semibold mb-6 border-b pb-4">Shipping Information</h2>
          <form onSubmit={handleCheckout}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Full Address
              </label>
              <textarea
                required
                rows={4}
                className="w-full border rounded p-3 focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="123 Street Name, City, Country, ZIP"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="mt-6 w-full bg-primary text-white py-3 rounded-lg hover:bg-black transition-colors disabled:opacity-50"
            >
              {loading ? "Processing..." : "Place Order (Cash on Delivery)"}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3 mt-8 lg:mt-0 bg-gray-50 p-6 rounded shadow-sm border h-fit">
          <h3 className="text-xl font-semibold mb-4 border-b pb-4">Order Summary</h3>
          <div className="flex flex-col gap-4 mb-6">
            {cart.cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{item.name} x {item.cartQuantity}</span>
                <span className="font-semibold">৳{(item.sellingPrice * item.cartQuantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center border-t pt-4">
            <span className="font-bold text-lg">Total Payable</span>
            <span className="font-bold text-xl text-primary">৳{cart.cartTotalAmount.toFixed(2)}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CheckoutPage;
