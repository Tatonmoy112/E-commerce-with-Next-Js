'use client'
import BreadCrumb from '@/components/Application/admin/BreadCrumb';
import DatatableWrapper from '@/components/Application/admin/DatatableWrapper';
import DeleteAction from '@/components/Application/admin/DeleteAction';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DT_CATEGORY_COLUMN, DT_CUPON_COLUMN, DT_CUSTOMERS_COLUMN, DT_ORDERS_COLUMN, DT_PRODUCT_COLUMN, DT_PRODUCT_VARIANT_COLUMN, DT_REVIEW_COLUMN } from '@/lib/column';
import { columnConfig } from '@/lib/helperFunction';
import { 
  ADMIN_DASHBOARD, 
  ADMIN_CATEGORY_SHOW, 
  ADMIN_TRASH, 
  ADMIN_PRODUCT_SHOW, 
  ADMIN_PRODUCT_VARIANT_SHOW, 
  ADMIN_CUPON_SHOW, 
  ADMIN_CUSTOMERS_SHOW, 
  ADMIN_REVIEW_SHOW, 
  ADMIN_ORDERS_SHOW 
} from '@/routes/AdminPanelRoute';
import { useSearchParams } from 'next/navigation';
import React, { useCallback, useMemo } from 'react';

const TRASH_CONFIG = {
  category: {
    title: "Category Trash",
    parentLabel: "Category",
    parentRoute: ADMIN_CATEGORY_SHOW,
    columns: DT_CATEGORY_COLUMN,
    fetchUrl: '/api/category',
    exportUrl: '/api/category/export',
    deleteUrl: '/api/category/delete',
  },
  product: {
    title: "Product Trash",
    parentLabel: "Product",
    parentRoute: ADMIN_PRODUCT_SHOW,
    columns: DT_PRODUCT_COLUMN,
    fetchUrl: '/api/product',
    exportUrl: '/api/product/export',
    deleteUrl: '/api/product/delete',
  },
  "product-variant": {
    title: "Product Variant Trash",
    parentLabel: "Product Variant",
    parentRoute: ADMIN_PRODUCT_VARIANT_SHOW,
    columns: DT_PRODUCT_VARIANT_COLUMN,
    fetchUrl: '/api/product-variant',
    exportUrl: '/api/product-variant/export',
    deleteUrl: '/api/product-variant/delete',
  },
  cupon: {
    title: "Cupon Trash",
    parentLabel: "Cupon",
    parentRoute: ADMIN_CUPON_SHOW,
    columns: DT_CUPON_COLUMN,
    fetchUrl: '/api/cupon',
    exportUrl: '/api/cupon/export',
    deleteUrl: '/api/cupon/delete',
  },
  customers: {
    title: "Customers Trash",
    parentLabel: "Customers",
    parentRoute: ADMIN_CUSTOMERS_SHOW,
    columns: DT_CUSTOMERS_COLUMN,
    fetchUrl: '/api/customers',
    exportUrl: '/api/customers/export',
    deleteUrl: '/api/customers/delete',
  },
  review: {
    title: "Review Trash",
    parentLabel: "Review",
    parentRoute: ADMIN_REVIEW_SHOW,
    columns: DT_REVIEW_COLUMN,
    fetchUrl: '/api/review',
    exportUrl: '/api/review/export',
    deleteUrl: '/api/review/delete',
  },
  orders: {
    title: "Orders Trash",
    parentLabel: "Orders",
    parentRoute: ADMIN_ORDERS_SHOW,
    columns: DT_ORDERS_COLUMN,
    fetchUrl: '/api/orders/admin',
    exportUrl: '/api/orders/export',
    deleteUrl: '/api/orders/delete',
  }
}

const Trash = () => {
  const searchParams = useSearchParams();
  const trashOf = searchParams.get('trashof');
  const config = TRASH_CONFIG[trashOf];

  const dynamicBreadcrumb = useMemo(() => {
    if (!config) return [];
    return [
      { href: ADMIN_DASHBOARD, label: "Home" },
      { href: config.parentRoute, label: config.parentLabel },
      { href: "", label: "Trash" },
    ];
  }, [config]);

  // Guard against undefined config
  const columns = useMemo(() => {
    if (!config) return [];
    return columnConfig(config.columns, false, false, true);
  }, [config]);

  const action = useCallback((row, deleteType, handleDelete) => {
    return [<DeleteAction key='delete' handleDelete={handleDelete} row={row} deleteType={deleteType} />];
  }, []);

  if (!config) {
    return <p className="p-4 text-red-500">Invalid trash type: {trashOf}</p>;
  }

  return (
    <div>
      <BreadCrumb breadcrumbData={dynamicBreadcrumb} />
      <Card className="py-0 rounded shadow-sm">
        <CardHeader className="pt-3 py-2 px-3 border-b [.border-b]:py-2">
          <div className='flex justify-between items-center'>
            <h4 className='text-xl font-semibold'>{config.title}</h4>
          </div>
        </CardHeader>
        <CardContent className='pb-5'>
          <DatatableWrapper
            queryKey={`${trashOf}-data-deleted`}
            fetchUrl={config.fetchUrl}
            initialPageSize={10}
            columnsConfig={columns}
            exportEndPoint={config.exportUrl}
            deleteEndPoint={config.deleteUrl}
            deleteType="PD"
            trashView={`${ADMIN_TRASH}?trashof=${trashOf}`}
            createAction={action}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default Trash;
