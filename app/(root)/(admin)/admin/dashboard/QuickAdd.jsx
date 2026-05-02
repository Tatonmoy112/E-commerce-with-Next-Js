'use client'
import { ADMIN_CATEGORY_ADD,  ADMIN_CUPON_ADD,  ADMIN_MEDIA_SHOW, ADMIN_PRODUCT_ADD} from '@/routes/AdminPanelRoute';
import Link from 'next/link'
import React from 'react'
import { BiCategory } from "react-icons/bi";
import { IoShirtOutline } from "react-icons/io5";
import { MdOutlinePermMedia } from "react-icons/md";
import { RiCoupon2Line } from "react-icons/ri";

const QuickAdd = () => {
   

  return (
    <div className='grid lg:grid-cols-4 sm:grid-cols-2 sm:gap-10 gap-5'>
     <Link href={ADMIN_CATEGORY_ADD} >
       <div className='flex items-center justify-between p-3 rounded-lg shadow bg-white dark:bg-card bg-gradient-to-tr from-green-400 via-green-500 to-green-600  '>
        <div > <h4 className='font-medium text-white dark:text-black'>Add Categories</h4>
       
        </div>
        <div>
          <span className='w-12 h-12 border flex justify-center items-center rounded-full dark:border-green-800 text-white'> <BiCategory /></span>
        </div>

       </div>
     </Link>
     <Link href={ADMIN_PRODUCT_ADD} >
       <div className='flex items-center justify-between p-3 rounded-lg shadow bg-white dark:bg-card bg-gradient-to-tr from-blue-400 via-blue-500 to-blue-600  '>
        <div > <h4 className='font-medium text-white dark:text-black'>Add Products</h4>
        
        </div>
        <div>
         <span className='w-12 h-12 border flex justify-center items-center rounded-full dark:border-blue-800 text-white'> <IoShirtOutline /></span>
        </div>

       </div>
     </Link>
     <Link href={ADMIN_CUPON_ADD} >
     <div className='flex items-center justify-between p-3 rounded-lg shadow bg-white dark:bg-card bg-gradient-to-tr from-yellow-400 via-yellow-500 to-yellow-600  '>
        <div > <h4 className='font-medium text-white dark:text-black'>Add Cupon</h4>
        
        </div>
        <div>
          <span className='w-12 h-12 border flex justify-center items-center rounded-full dark:border-yellow-800 text-white'> < RiCoupon2Line /></span>
        </div>

       </div>
     </Link>
     <Link href={ADMIN_MEDIA_SHOW} >
       <div className='flex items-center justify-between p-3 rounded-lg shadow bg-white dark:bg-card bg-gradient-to-tr from-cyan-400 via-cyan-500 to-cyan-600  '>
        <div > <h4 className='font-medium text-white dark:text-black'>Upload Media</h4>
        
        </div>
        <div>
          <span className='w-12 h-12 border flex justify-center items-center rounded-full dark:border-cyan-800 text-white'> <MdOutlinePermMedia/></span>
        </div>

       </div>
     </Link>
    </div>
  )
}

export default QuickAdd
