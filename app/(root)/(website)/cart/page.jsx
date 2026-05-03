'use client'
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Link from "next/link";
import { addToCart, decreaseCart, removeFromCart, clearCart, getTotals } from "@/store/reducer/cartReducer";
import { WEBSITE_SHOP } from "@/routes/WebsiteRoute";
import Image from "next/image";
import imgPlaceholder from '@/public/assets/images/img-placeholder.webp'
import WebsiteBreadCrumb from "@/components/Application/Website/WebsiteBreadCrumb";

const breadcrumb = {
  title: "Shopping Cart",
  links: [
    { label: "Home", href: "/" },
    { label: "Cart", href: "/cart" },
  ],
};

const CartPage = () => {
  const cart = useSelector((state) => state.cartStore);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getTotals());
  }, [cart.cartItems, dispatch]);

  const handleRemoveFromCart = (cartItem) => dispatch(removeFromCart(cartItem));
  const handleDecreaseCart = (cartItem) => dispatch(decreaseCart(cartItem));
  const handleIncreaseCart = (cartItem) => dispatch(addToCart(cartItem));
  const handleClearCart = () => dispatch(clearCart());

  return (
    <div>
      <WebsiteBreadCrumb props={breadcrumb} />
      <div className="container mx-auto px-4 py-8 lg:px-32">
        {cart.cartItems.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold mb-4">Your cart is currently empty</h2>
            <Link href={WEBSITE_SHOP} className="text-primary underline">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div>
            <div className="hidden lg:grid grid-cols-4 gap-4 border-b pb-2 text-gray-500 font-semibold mb-4">
              <h3 className="col-span-2">Product</h3>
              <h3>Price</h3>
              <h3>Quantity</h3>
              <h3>Total</h3>
            </div>
            <div className="flex flex-col gap-6">
              {cart.cartItems.map((cartItem) => (
                <div key={cartItem.id} className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center border-b pb-4">
                  <div className="col-span-2 flex items-center gap-4">
                    <Image
                      src={cartItem.media?.[0]?.secure_url || imgPlaceholder.src}
                      alt={cartItem.name}
                      width={100}
                      height={100}
                      className="rounded"
                    />
                    <div>
                      <h3 className="font-semibold">{cartItem.name}</h3>
                      <button onClick={() => handleRemoveFromCart(cartItem)} className="text-red-500 text-sm mt-1">
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="hidden lg:block">৳{cartItem.sellingPrice}</div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded">
                      <button onClick={() => handleDecreaseCart(cartItem)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200">-</button>
                      <div className="px-3">{cartItem.cartQuantity}</div>
                      <button onClick={() => handleIncreaseCart(cartItem)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200">+</button>
                    </div>
                  </div>
                  <div className="font-semibold text-lg">
                    ৳{(cartItem.sellingPrice * cartItem.cartQuantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-start mt-8 pt-8 border-t">
              <button onClick={handleClearCart} className="text-gray-500 underline">
                Clear Cart
              </button>
              <div className="w-full lg:w-1/3 bg-gray-50 p-6 rounded">
                <div className="flex justify-between mb-4">
                  <span className="font-semibold">Subtotal</span>
                  <span className="font-semibold text-xl">৳{cart.cartTotalAmount.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-500 mb-6">Taxes and shipping calculated at checkout</p>
                <Link href="/checkout">
                  <button className="w-full bg-primary text-white py-3 rounded-lg hover:bg-black transition-colors">
                    Check out
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
