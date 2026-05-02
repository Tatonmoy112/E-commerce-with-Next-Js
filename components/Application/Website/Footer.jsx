import Image from 'next/image'
import React from 'react'
import logo from '@/public/assets/images/logo-black.png'
import Link from 'next/link'
import { WEBSITE_HOME, WEBSITE_LOGIN, WEBSITE_REGISTER } from '@/routes/WebsiteRoute'
import { IoLocationOutline } from "react-icons/io5";
import { MdOutlineLocalPhone } from "react-icons/md";
import { MdOutlineMailOutline } from "react-icons/md";
import { FaYoutube } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaWhatsapp } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa";
const Footer = () => {
  return (
    <footer className='bg-gray-50 border-t'>
        <div className='grid lg:grid-cols-5 md:grid-cols-2 grid-cols-1 gap-10 py-10 lg:px-32 px-4'>
              <div className='lg:col-span-1 md:col-span-2 col-span-1'>
                  <Image 
                             src={logo}
                             alt='logo'
                             width={383}
                             height={146}
                             className='lg:w-30 w-24'
                             />

                  <p className='text-gray-500 pt-2'>E-store is your trusted destination for quality and convenience. From fashion to essentials, we bring everything you need right to your doorstep. Shop smart, live better — only at E-store </p>
              </div>

              <div className=''>
                <h4 className='text-xl font-bold mb-5 uppercase'>Categories</h4>
                <ul>
                    <li className='mb-2 text-gray-500'>
                        <Link href={''} >
                         T-shirt
                        </Link>
                    </li>
                    <li className='mb-2 text-gray-500'>
                        <Link href={''} >
                         Hoodies
                        </Link>
                    </li>
                    <li className='mb-2 text-gray-500'>
                        <Link href={''} >
                         Oversized
                        </Link>
                    </li>
                    <li className='mb-2 text-gray-500'>
                        <Link href={''} >
                         Full Sleeves
                        </Link>
                    </li>
                    <li className='mb-2 text-gray-500'>
                        <Link href={''} >
                         Polo
                        </Link>
                    </li>
                </ul>

              </div>
              <div className=''>
                <h4 className='text-xl font-bold mb-5 uppercase'>Usefull Links</h4>
                <ul>
                    <li className='mb-2 text-gray-500'>
                        <Link href={WEBSITE_HOME} >
                         Home
                        </Link>
                    </li>
                    <li className='mb-2 text-gray-500'>
                        <Link href={''} >
                         Shop
                        </Link>
                    </li>
                    <li className='mb-2 text-gray-500'>
                        <Link href={''} >
                         About
                        </Link>
                    </li>
                    <li className='mb-2 text-gray-500'>
                        <Link href={WEBSITE_REGISTER} >
                         Register 
                        </Link>
                    </li>
                    <li className='mb-2 text-gray-500'>
                        <Link href={WEBSITE_LOGIN} >
                         Login
                        </Link>
                    </li>
                </ul>

              </div>
              <div className=''>
                <h4 className='text-xl font-bold mb-5 uppercase'>Help Center</h4>
                <ul>
                    <li className='mb-2 text-gray-500'>
                        <Link href={WEBSITE_REGISTER} >
                         Register
                        </Link>
                    </li>
                    <li className='mb-2 text-gray-500'>
                        <Link href={WEBSITE_LOGIN} >
                         Login
                        </Link>
                    </li>
                    <li className='mb-2 text-gray-500'>
                        <Link href={''} >
                         My Account
                        </Link>
                    </li>
                    <li className='mb-2 text-gray-500'>
                        <Link href={''} >
                         Privacy Policy 
                        </Link>
                    </li>
                    <li className='mb-2 text-gray-500'>
                        <Link href={''} >
                         Terms & Conditions
                        </Link>
                    </li>
                </ul>

              </div>
              <div className=''>
                <h4 className='text-xl font-bold mb-5 uppercase'>Contact Us</h4>
                <ul>
                    <li className='flex items-center gap-3 mb-2 text-gray-500'>
                       <IoLocationOutline size={20} />
                       <p>E-store market Badda, Dhaka 1200</p>
                    </li>
                    <li className='flex items-center gap-3 mb-2 text-gray-500'>
                       <MdOutlineLocalPhone size={20} />
                       <Link href='tel:+8801756425539' className='hover:text-primary'>+880 1756425539</Link>
 
                    </li>
                    <li className='flex items-center gap-3 mb-2 text-gray-500'>
                        <MdOutlineMailOutline size={20}  />
                        <Link href="mailto:ridwanulbasit32@gmail.com" className="hover:text-primary">ridwanulbasit32@gmail.com</Link>
                    </li>
                </ul>

                <div className='flex gap-5 mt-5'>
                    
                 <Link href='' > < FaYoutube   className='text-primary' size={25}/>  </Link> 
                 <Link href='' > < FaInstagram className='text-primary' size={25}/> </Link> 
                 <Link href='' > < FaWhatsapp className='text-primary' size={25}/> </Link> 
                 <Link href='' > < FaFacebook className='text-primary' size={25}/> </Link> 

                </div>

              </div>
        </div>

        <div className='py-5 bg-gray-100'>
              <p className='text-center'>© 2025 Ridwanul Basit. All Rights Reserved. </p>
        </div>
    </footer>
  )
}

export default Footer
