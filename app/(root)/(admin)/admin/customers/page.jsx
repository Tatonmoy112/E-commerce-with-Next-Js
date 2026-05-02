'use client'
import BreadCrumb from '@/components/Application/admin/BreadCrumb';
import DatatableWrapper from '@/components/Application/admin/DatatableWrapper';
import DeleteAction from '@/components/Application/admin/DeleteAction';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {  DT_CUSTOMERS_COLUMN } from '@/lib/column';

import { columnConfig } from '@/lib/helperFunction';
import {  ADMIN_DASHBOARD,  ADMIN_TRASH } from '@/routes/AdminPanelRoute';

import React, { useCallback, useMemo } from 'react'



const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: "Home" },
  { href: "", label: "Users"}

];

const ShowCustomres = () => {

  const columns = useMemo(()=>{
    return columnConfig(DT_CUSTOMERS_COLUMN)
  })

  const action = useCallback((row,deleteType,handleDelete)=>{
     let actionMenu = []
     actionMenu.push( <DeleteAction key='delete' handleDelete={handleDelete} row={row} deleteType={deleteType} /> )
     return actionMenu
  })
  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData}  />
       <Card className="py-0 rounded shadow-sm">
        <CardHeader className="pt-3 py-2 px-3 border-b [.border-b]:py-2 ">
         <div className='flex justify-between items-center'>
          <h4 className='text-xl font-semibold'>Customers</h4>
         </div>
        </CardHeader>
        <CardContent className='pb-5'>
         <DatatableWrapper
         queryKey = "customers-data"
         fetchUrl = '/api/customers'
         initialPageSize={10}
         columnsConfig={columns}
         exportEndPoint={'/api/customers/export'}
         deleteEndPoint='/api/customers/delete'
         deleteType="SD"
         trashView={`${ADMIN_TRASH}?trashof=customers`}
         createAction= {action}

         />
        </CardContent>
      </Card> 
    </div>
  )
}

export default ShowCustomres