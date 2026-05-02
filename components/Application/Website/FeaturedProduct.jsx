"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { IoIosArrowRoundForward } from "react-icons/io";
import ProductBox from "./ProductBox";

const FeaturedProduct = () => {
  const [productData, setProductData] = useState({
    success: false,
    data: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get("/api/product/get-featured-product");

        setProductData({
          success: res.data.success,
          data: res.data.data || []
        });
      } catch (error) {
        console.error("FEATURED PRODUCT ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <section className="lg:px-32 px-4 sm:py-10">
      <div className="flex justify-between items-center mb-5">
        <h2 className="sm:text-4xl text-2xl font-bold">Featured Products</h2>
        <Link
          href={""}
          className="flex items-center gap-2 underline underline-offset-4 hover:text-primary"
        >
          View All
          <IoIosArrowRoundForward />
        </Link>
      </div>

      <div className="grid md:grid-cols-4 grid-cols-2 sm:gap-10 gap-2">

        {/* LOADING */}
        {loading && <div>Loading...</div>}

        {/* NO DATA */}
        {!loading && productData.data.length === 0 && (
          <div>No Data Found</div>
        )}

        {/* SHOW PRODUCTS */}
        {!loading &&
          productData.data.length > 0 &&
          productData.data.map((product) => (
            <ProductBox key={product._id} product={product} />
          ))}
      </div>
    </section>
  );
};

export default FeaturedProduct;
