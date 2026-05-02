import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Chip } from "@mui/material"

import userIcon from '@/public/assets/images/user.png'
import Image from "next/image";

export const DT_CATEGORY_COLUMN=[
    {
    accessorKey: 'name', //access nested data with dot notation
        header: 'Category Name',
    },
    {
    accessorKey: 'slug', //access nested data with dot notation
        header: 'Slug',
    },

]
export const DT_PRODUCT_COLUMN=[
    {
    accessorKey: 'name', //access nested data with dot notation
        header: 'Product Name',
    },
    {
    accessorKey: 'slug', //access nested data with dot notation
        header: 'Slug',
    },
    {
    accessorKey: 'category', //access nested data with dot notation
        header: 'Category',
    },
    {
    accessorKey: 'mrp', //access nested data with dot notation
        header: 'MRP',
    },
    {
    accessorKey: 'sellingPrice', //access nested data with dot notation
        header: 'Selling Price',
    },
    {
    accessorKey: 'discountPercentage', //access nested data with dot notation
        header: 'Discount Percentage',
    },

]
export const DT_PRODUCT_VARIANT_COLUMN=[
    {
    accessorKey: 'product', //access nested data with dot notation
        header: 'Product Name',
    },
    {
    accessorKey: 'color', //access nested data with dot notation
        header: 'Color',
    },
    {
    accessorKey: 'size', //access nested data with dot notation
        header: 'Size',
    },
    {
    accessorKey: 'sku', //access nested data with dot notation
        header: 'SKU',
    },
    {
    accessorKey: 'mrp', //access nested data with dot notation
        header: 'MRP',
    },
    {
    accessorKey: 'sellingPrice', //access nested data with dot notation
        header: 'Selling Price',
    },
    {
    accessorKey: 'discountPercentage', //access nested data with dot notation
        header: 'Discount Percentage',
    },

]
export const DT_CUPON_COLUMN=[
    {
    accessorKey: 'code', //access nested data with dot notation
        header: 'Code Name',
    },
    {
    accessorKey: 'discountPercentage', //access nested data with dot notation
        header: 'Discount Percentage',
    },
    {
    accessorKey: 'minimumShoppingAmount', //access nested data with dot notation
        header: 'Minimum Shopping Amount',
    },
    {
    accessorKey: 'validity',
header: 'Validity Date',
Cell: ({ renderedCellValue }) => {
  const date = new Date(renderedCellValue);
  const isExpired = new Date() > date;

  return (
    <Chip
      color={isExpired ? "error" : "success"}
      label={date.toLocaleDateString()}
    />
  );
}

    },
   

]
export const DT_CUSTOMERS_COLUMN=[
   {
  accessorKey: 'avtar',
  header: 'Avatar',
  Cell: ({ renderedCellValue }) => (
    <Avatar>
  {renderedCellValue?.url ? (
    <AvatarImage src={renderedCellValue.url} />
  ) : (
    <AvatarFallback>
      <Image src={userIcon} alt="User" width={70} height={70} />
    </AvatarFallback>
  )}
</Avatar>

  )
},
 {
    accessorKey: 'name', //access nested data with dot notation
        header: 'Name',
    },
    {
    accessorKey: 'email', //access nested data with dot notation
        header: 'Email',
    },
    {
    accessorKey: 'phone', //access nested data with dot notation
        header: 'Phone',
    },
    {
    accessorKey: 'address', //access nested data with dot notation
        header: 'Address',
    },
     {
    accessorKey: 'role', //access nested data with dot notation
        header: 'Role',
    },
    {
  accessorKey: 'isEmailVerified', // access nested data with dot notation
  header: 'Is Verified',
  Cell: ({ renderedCellValue }) => {
    // renderedCellValue is expected to be a boolean
    const isVerified = Boolean(renderedCellValue);

    return (
      <Chip
        color={isVerified ? "success" : "error"}
        label={isVerified ? "Verified" : "Not Verified"}
      />
    );
  }
}
]
export const DT_REVIEW_COLUMN=[
    {
    accessorKey: 'product', //access nested data with dot notation
        header: 'Product Name',
    },
    {
    accessorKey: 'user', //access nested data with dot notation
        header: 'User Name',
    },
    {
    accessorKey: 'title', //access nested data with dot notation
        header: 'Title',
    },
    {
    accessorKey: 'rating', //access nested data with dot notation
        header: 'Rating',
    },
    {
    accessorKey: 'review', //access nested data with dot notation
        header: 'Review',
    },
    

]