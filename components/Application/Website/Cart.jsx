import React from 'react'
import { BsCart2 } from "react-icons/bs";
import { useSelector } from 'react-redux';
import Link from 'next/link';

const Cart = () => {
  const { cartTotalQuantity } = useSelector((state) => state.cartStore);

  return (
    <Link href="/cart" className="relative flex items-center">
      <button type='button'> 
        <BsCart2 
          className='text-gray-500 hover:text-primary cursor-pointer'
          size={25}
        />
      </button>
      {cartTotalQuantity > 0 && (
        <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
          {cartTotalQuantity}
        </span>
      )}
    </Link>
  )
}

export default Cart

