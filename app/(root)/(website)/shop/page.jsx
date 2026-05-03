'use client'
import Filter from "@/components/Application/Website/Filter";
import Shorting from "@/components/Application/Website/Shorting";
import WebsiteBreadCrumb from "@/components/Application/Website/WebsiteBreadCrumb";
import { WEBSITE_SHOP } from "@/routes/WebsiteRoute";
import React, { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import ProductBox from "@/components/Application/Website/ProductBox";
import { ButtonLoading } from "@/components/Application/ButtonLoading";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import useWindowSize from "@/hooks/useWindowSize";

const breadcrumb = {
  title: "Shop",
  links: [
    {
      label: "Shop",
      href: WEBSITE_SHOP,
    },
  ],
};

const ShopPage = () => {
  const [limit,setLimit] = useState(9)
  const [sorting, setSorting] = useState("default_sorting")
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const windowSize = useWindowSize();
  const searchParams = useSearchParams();

  const fetchShopProducts = async (page) => {
    const { data } = await axios.get(`/api/shop?${searchParams.toString()}&page=${page}&limit=${limit}&sort=${sorting}`);
    return data;
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    status,
    error
  } = useInfiniteQuery({
    queryKey: ["shop-products", searchParams.toString(), limit, sorting],
    queryFn: async ({ pageParam }) => fetchShopProducts(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      const nextPage = pages.length;
      return lastPage.meta.totalCount > (nextPage * limit) ? nextPage : undefined;
    },
  });

  return (
    <div>
      <WebsiteBreadCrumb props={breadcrumb} />
      <section className="lg:flex lg:px-32 px-4 my-20 ">
        {windowSize.width > 1024 ? (
          <div className="w-72 me-4">
            <div className="sticky top-0 bg-gray-50 p-4 rounded">
              <Filter />
            </div>
          </div>
        ) : (
          <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
            <SheetContent side="left" className="block">
              <SheetHeader>
                <SheetTitle className="border-b pb-2">Filter</SheetTitle>
                <SheetDescription className="hidden"></SheetDescription>
                <div className="mt-5 overflow-auto h-[calc(100vh-80px)]">
                  <Filter />
                </div>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        )}

        <div className="lg:w-[calc(100%-18rem)] w-full">
          <Shorting
            limit={limit}
            setLimit={setLimit}
            sorting={sorting}
            setSorting={setSorting}
            isMobileFilterOpen={isMobileFilterOpen}
            setIsMobileFilterOpen={setIsMobileFilterOpen}
          />

          {/* PRODUCT GRID */}
          <div className="mt-10">
            {status === "pending" ? (
              <div className="grid md:grid-cols-3 grid-cols-2 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-[400px] bg-gray-100 animate-pulse rounded-2xl"></div>
                ))}
              </div>
            ) : status === "error" ? (
              <div className="text-red-500 text-center py-20 font-bold">{error.message}</div>
            ) : (
              <>
                <div className="grid md:grid-cols-3 grid-cols-2 gap-5">
                  {data?.pages?.map((page, index) => (
                    <React.Fragment key={index}>
                      {page?.data?.map((product) => (
                        <ProductBox key={product.id} product={product} />
                      ))}
                    </React.Fragment>
                  ))}
                </div>

                {data?.pages[0].data.length === 0 && (
                  <div className="text-center py-20">
                    <h3 className="text-2xl font-bold text-gray-400 italic">No Products Found</h3>
                    <p className="text-gray-400 mt-2">Try adjusting your filters or search terms.</p>
                  </div>
                )}

                {hasNextPage && (
                  <div className="flex justify-center mt-10">
                    <ButtonLoading
                      type="button"
                      onClick={() => fetchNextPage()}
                      loading={isFetching}
                      text="Load More"
                    />
                  </div>
                )}
                
                {!hasNextPage && data?.pages[0].data.length > 0 && (
                  <p className="text-center mt-10 text-gray-400 italic font-medium">Nothing more to Load</p>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ShopPage;
