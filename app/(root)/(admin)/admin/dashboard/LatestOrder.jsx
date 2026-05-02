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

const LatestOrder = () => {
  return (
    <Table>
  <TableCaption>A list of your recent invoices.</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead >Order Id</TableHead>
      <TableHead >Payment Id</TableHead>
      <TableHead >Items</TableHead>
      <TableHead >Total Item</TableHead>
      <TableHead >Amount</TableHead>
      
    </TableRow>
  </TableHeader>
  <TableBody>
    {Array.from({length:20}).map((_,i) => (

    <TableRow key={i}>
      <TableCell >{`INV001${i+1}`}</TableCell>
      <TableCell >{`PAY${i+1}`}</TableCell>
      <TableCell >3</TableCell>
      <TableCell >Pending</TableCell>
      <TableCell >100</TableCell>
      
    </TableRow>
    ))}
    
  </TableBody>
</Table>
  )
}

export default LatestOrder
