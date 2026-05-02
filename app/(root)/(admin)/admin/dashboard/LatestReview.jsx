import React from 'react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { IoIosStar } from "react-icons/io";
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import imgPlaceholder from '@/public/assets/images/img-placeholder.webp'

const LatestReview = () => {
  return (
    <Table>
     <TableCaption>A list of your recent invoices.</TableCaption>
     <TableHeader>
       <TableRow>
         <TableHead >Product</TableHead>
         <TableHead >Ratings</TableHead>
       </TableRow>
     </TableHeader>
     <TableBody>
       {Array.from({length:20}).map((_,i) => (
   
       <TableRow key={i}>
         <TableCell className='flex items-center gap-3'>
            <Avatar>
                <AvatarImage src={imgPlaceholder.src} />
            </Avatar>
            <span className='line-clamp-1'>Lorem ipsum dolor sit amet.</span>
         </TableCell>
         <TableCell  >

            <div className='flex items-center'>
                 {Array.from({length:5}).map((_,i) => (
                <span key={i}>
                    <IoIosStar className='text-yellow-500' />
                </span>
                   
                    ))}
            </div>
            
            </TableCell> 
       </TableRow>
       ))}
       
     </TableBody>
   </Table>
  )
}

export default LatestReview
