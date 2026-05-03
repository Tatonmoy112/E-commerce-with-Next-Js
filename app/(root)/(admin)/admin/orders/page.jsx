'use client'
import BreadCrumb from '@/components/Application/admin/BreadCrumb';
import DatatableWrapper from '@/components/Application/admin/DatatableWrapper';
import DeleteAction from '@/components/Application/admin/DeleteAction';
import OrderDetailsModal from '@/components/Application/admin/OrderDetailsModal';
import StatusAction from '@/components/Application/admin/StatusAction';
import { Divider } from '@mui/material';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DT_ORDERS_COLUMN } from '@/lib/column';
import { columnConfig } from '@/lib/helperFunction';
import { ADMIN_DASHBOARD, ADMIN_TRASH } from '@/routes/AdminPanelRoute';
import React, { useCallback, useMemo } from 'react'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: "Home" },
  { href: "", label: "Orders"}
];

const OrdersPage = () => {
  const queryKey = "orders-data";
  const columns = useMemo(() => {
    return columnConfig(DT_ORDERS_COLUMN)
  }, []);

  const action = useCallback((row, deleteType, handleDelete) => {
     let actionMenu = []
     actionMenu.push( <OrderDetailsModal key='view' row={row} /> )
     actionMenu.push( <StatusAction key='status' row={row} queryKey={queryKey} /> )
     actionMenu.push( <Divider key='divider' /> )
     actionMenu.push( <DeleteAction key='delete' handleDelete={handleDelete} row={row} deleteType={deleteType} /> )
     return actionMenu
  }, []);

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />
      <Card className="py-0 rounded shadow-sm">
        <CardHeader className="pt-3 py-2 px-3 border-b [.border-b]:py-2 ">
          <div className='flex justify-between items-center'>
            <h4 className='text-xl font-semibold'>All Orders</h4>
          </div>
        </CardHeader>
        <CardContent className='pb-5'>
          <DatatableWrapper
            queryKey="orders-data"
            fetchUrl='/api/orders/admin'
            initialPageSize={10}
            columnsConfig={columns}
            exportEndPoint={'/api/orders/export'}
            deleteEndPoint='/api/orders/delete'
            deleteType="SD"
            trashView={`${ADMIN_TRASH}?trashof=orders`}
            createAction={action}
          />
        </CardContent>
      </Card> 
    </div>
  )
}

export default OrdersPage
