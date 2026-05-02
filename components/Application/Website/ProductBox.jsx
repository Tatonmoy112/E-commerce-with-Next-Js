import React from "react";
import Image from "next/image";
import Link from "next/link";
import imgPlaceholder from '@/public/assets/images/img-placeholder.webp'
const ProductBox = ({ product }) => {
  const img = product.media?.[0]?.secure_url || imgPlaceholder.src;

  return (
    <div className="border rounded-2xl overflow-hidden bg-white hover:shadow-lg ">
      {/* IMAGE */}

     <Link href={''} >
     <Image
    src={img}
    alt={product.name}
    width={400}
    height={400}
    className="w-full lg:h-[300px] md:h-[200px] h-[150px]  object-cover object-top"
  />



      {/* DETAILS */}
      <div className="p-3 ">
        {/* NAME */}
        <h3 className="">
          {product.name}
        </h3>
        <div>
            <p>
            <span className="line-through text-gray-500 text-sm">
            ৳{product.mrp}
          </span>
          <span className="font-semibold pl-3 text-black text-lg">
            ৳{product.sellingPrice}
          </span>
        </p>
        </div>

      
      </div>
     </Link>
  
      </div>
 
  );
};

export default ProductBox;
