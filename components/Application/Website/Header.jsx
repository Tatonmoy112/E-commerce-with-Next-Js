'use client'
import { USER_DASHBOARD, WEBSITE_HOME, WEBSITE_LOGIN, WEBSITE_SHOP } from '@/routes/WebsiteRoute'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import logo from '@/public/assets/images/logo-black.png'
import { IoSearchOutline } from "react-icons/io5";
import { VscAccount } from "react-icons/vsc";
import Cart from './Cart'
import { useSelector } from 'react-redux'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import userIcon from '@/public/assets/images/user.png'
import { FaBars } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";

const Header = () => {
    
    const auth = useSelector(store => store.authStore.auth)
    const [isMobileMenu,setIsMobileMenu] = useState(false)

  return (
    <div className='bg-white border-b lg:px-32 px-4'>
        <div className='flex justify-between items-center lg:py-5 py-3'>
            
            <Image 
            src={logo}
            alt='logo'
            width={383}
            height={146}
            className='lg:w-30 w-24'
            />

           
            

            <div className='flex justify-between gap-20'>
                <nav className={`lg:relative lg:w-auto lg:top-0 lg:left-0 lg:p-0 transition-all lg:h-auto bg-white fixed z-50 top-0 w-full h-screen  ${isMobileMenu ? 'left-0' : '-left-full'} `}>
                <div className='lg:hidden flex justify-between items-center bg-gray-50 py-3 border-b px-3'>
                       <Image 
            src={logo}
            alt='logo'
            width={383}
            height={146}
            className='lg:w-30 w-24'
            />

                     <button className='lg:hidden block'>
                        <IoMdClose className='text-gray-500 hover:text-primary' onClick={()=>setIsMobileMenu(false)}   size={25}/>
                    </button>
                </div>
                    <ul className='lg:flex justify-between items-center gap-10 px-3 '>
                        <li className='text-gray-600 hover:text-primary hover:font-semibold'>
                            <Link href={WEBSITE_HOME} className='block py-2'>
                            Home
                            </Link>
                        </li>
                        <li className='text-gray-600 hover:text-primary hover:font-semibold'>
                            <Link href={WEBSITE_HOME} className='block py-2'>
                            About
                            </Link>
                        </li>
                        <li className='text-gray-600 hover:text-primary hover:font-semibold'>
                            <Link href={WEBSITE_SHOP} className='block py-2'>
                            Shop
                            </Link>
                        </li>
                        <li className='text-gray-600 hover:text-primary hover:font-semibold'>
                            <Link href={WEBSITE_HOME} className='block py-2'>
                            T-shirt
                            </Link>
                        </li>
                        <li className='text-gray-600 hover:text-primary hover:font-semibold'>
                            <Link href={WEBSITE_HOME} className='block py-2'>
                           Hoodies
                            </Link>
                        </li>
                        <li className='text-gray-600 hover:text-primary hover:font-semibold'>
                            <Link href={WEBSITE_HOME} className='block py-2'>
                            Oversized
                            </Link>
                        </li>
                        <li className='text-gray-600 hover:text-primary hover:font-semibold'>
                            <Link href={WEBSITE_HOME} className='block py-2'>
                            T-shirt
                            </Link>
                        </li>
                    </ul>
                </nav>

                <div className='flex justify-between items-center gap-8'>
                 <button type='button'> 
                    <IoSearchOutline 
                    className='text-gray-500 hover:text-primary cursor-pointer'
                    size={25}
                    />
                 </button>
                 <Cart/>

                  {!auth
                  ?
                    <Link href={WEBSITE_LOGIN} >
                                        <VscAccount  
                                        className='text-gray-500 hover:text-primary cursor-pointer'
                                        size={25}
                                        />
                   </Link>
                   :

                   <Link href={USER_DASHBOARD}>
                    <Avatar >
                        <AvatarImage src={auth?.avtar?.null || userIcon.src }   />
                    </Avatar>

                   </Link>



                  }

                  <button className='lg:hidden block' onClick={()=>setIsMobileMenu(true)}>
                        <FaBars className='text-gray-500 hover:text-primary'   size={25}/>
                    </button>

                   
                </div>

            </div>
        </div>
    
    </div>
  )
}

export default Header
