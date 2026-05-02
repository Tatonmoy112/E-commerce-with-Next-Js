'use client'
import BreadCrumb from '@/components/Application/admin/BreadCrumb';
import DatatableWrapper from '@/components/Application/admin/DatatableWrapper';
import DeleteAction from '@/components/Application/admin/DeleteAction';
import EditAction from '@/components/Application/admin/EditAction';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DT_CUPON_COLUMN } from '@/lib/column';

import { columnConfig } from '@/lib/helperFunction';
import {ADMIN_CUPON_ADD, ADMIN_CUPON_EDIT, ADMIN_CUPON_SHOW, ADMIN_DASHBOARD,  ADMIN_TRASH } from '@/routes/AdminPanelRoute';
import Link from 'next/link';
import React, { useCallback, useMemo } from 'react'
import { FiPlus } from 'react-icons/fi';


const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: "Home" },
  { href: ADMIN_CUPON_SHOW, label: "Cupon" },

];

const ShowCupon = () => {

  const columns = useMemo(()=>{
    return columnConfig(DT_CUPON_COLUMN)
  })

  const action = useCallback((row,deleteType,handleDelete)=>{
     let actionMenu = []
     actionMenu.push( <EditAction key='edit' href={ADMIN_CUPON_EDIT(row.original._id)} /> )
     actionMenu.push( <DeleteAction key='delete' handleDelete={handleDelete} row={row} deleteType={deleteType} /> )
     return actionMenu
  })
  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData}  />
       <Card className="py-0 rounded shadow-sm">
        <CardHeader className="pt-3 py-2 px-3 border-b [.border-b]:py-2 ">
         <div className='flex justify-between items-center'>
          <h4 className='text-xl font-semibold'>Show Cupon</h4>
         <Link href={ADMIN_CUPON_ADD}>
  <Button className="flex items-center gap-2">
    <FiPlus />
    New Product
  </Button>
</Link>

         </div>
        </CardHeader>
        <CardContent className='pb-5'>
         <DatatableWrapper
         queryKey = "cupon-data"
         fetchUrl = '/api/cupon'
         initialPageSize={10}
         columnsConfig={columns}
         exportEndPoint={'/api/cupon/export'}
         deleteEndPoint='/api/cupon/delete'
         deleteType="SD"
         trashView={`${ADMIN_TRASH}?trashof=cupon`}
         createAction= {action}

         />
        </CardContent>
      </Card> 
    </div>
  )
}

export default ShowCupon