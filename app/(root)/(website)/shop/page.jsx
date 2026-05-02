'use client'
import Filter from "@/components/Application/Website/Filter";
import Shorting from "@/components/Application/Website/Shorting";
import WebsiteBreadCrumb from "@/components/Application/Website/WebsiteBreadCrumb";
import { WEBSITE_SHOP } from "@/routes/WebsiteRoute";
import React, { useState } from "react";
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
  const [isMobileFilterOpen,setIsMobileFilterOpen] = useState(false)
  const windowSize = useWindowSize()

  return (
    <div>
      <WebsiteBreadCrumb props={breadcrumb} />
      <section className="lg:flex lg:px-32 px-4 my-20 ">
        {windowSize.width >1024 
        ?
          <div className="w-72 me-4">
          <div className="sticky top-0 bg-gray-50 p-4 rounded">
            <Filter />
          </div>
        </div>

        :
        <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen} >
  
  <SheetContent side="left" className='block'>
    <SheetHeader >
      <SheetTitle className='border-b pb-2'>Filter</SheetTitle>
      <SheetDescription className='p-0'>
       
      </SheetDescription>
      <div className="mt-5 overflow-auto h-[calc(100vh-80px)]">
        <Filter />

      </div>
    </SheetHeader>
  </SheetContent>
</Sheet>
        }

        <div className="lg:w-[calc(100%-18rem)]">
          <Shorting    
          limit={limit}
          setLimit={setLimit}
          sorting={sorting}
          setSorting={setSorting}
          isMobileFilterOpen={isMobileFilterOpen}
          setIsMobileFilterOpen={setIsMobileFilterOpen}
          />
        </div>
      </section>
    </div>
  );
};

export default ShopPage;
