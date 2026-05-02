'use client'
import BreadCrumb from '@/components/Application/admin/BreadCrumb';
import DatatableWrapper from '@/components/Application/admin/DatatableWrapper';
import DeleteAction from '@/components/Application/admin/DeleteAction';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DT_CATEGORY_COLUMN, DT_CUPON_COLUMN, DT_CUSTOMERS_COLUMN, DT_PRODUCT_COLUMN, DT_PRODUCT_VARIANT_COLUMN, DT_REVIEW_COLUMN } from '@/lib/column';
import { columnConfig } from '@/lib/helperFunction';
import { ADMIN_DASHBOARD, ADMIN_CATEGORY_SHOW, ADMIN_TRASH } from '@/routes/AdminPanelRoute';
import { useSearchParams } from 'next/navigation';
import React, { useCallback, useMemo } from 'react';

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: "Home" },
  { href: ADMIN_CATEGORY_SHOW, label: "Category" },
  { href: ADMIN_TRASH, label: "Trash" },
];

const TRASH_CONFIG = {
  category: {
    title: "Category Trash",
    columns: DT_CATEGORY_COLUMN,
    fetchUrl: '/api/category',
    exportUrl: '/api/category/export',
    deleteUrl: '/api/category/delete',
  },
    product: {
      title: "Product Trash",
      columns: DT_PRODUCT_COLUMN,
      fetchUrl: '/api/product',
      exportUrl: '/api/product/export',
      deleteUrl: '/api/product/delete',
    },
     "product-variant": {
      title: "Product Variant Trash",
      columns: DT_PRODUCT_VARIANT_COLUMN,
      fetchUrl: '/api/product-variant',
      exportUrl: '/api/product-variant/export',
      deleteUrl: '/api/product-variant/delete',
    },
     cupon: {
      title: "Cupon Trash",
      columns: DT_CUPON_COLUMN,
      fetchUrl: '/api/cupon',
      exportUrl: '/api/cupon/export',
      deleteUrl: '/api/cupon/delete',
    },
     customers: {
      title: "Customers Trash",
      columns: DT_CUSTOMERS_COLUMN,
      fetchUrl: '/api/customers',
      exportUrl: '/api/customers/export',
      deleteUrl: '/api/customers/delete',
    },
     review: {
      title: "Review Trash",
      columns: DT_REVIEW_COLUMN,
      fetchUrl: '/api/review',
      exportUrl: '/api/review/export',
      deleteUrl: '/api/review/delete',
    }
}


const Trash = () => {
  const searchParams = useSearchParams();
  const trashOf = searchParams.get('trashof');
  const config = TRASH_CONFIG[trashOf];

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
      <BreadCrumb breadcrumbData={breadcrumbData} />
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
            initialPageSize={10}  // Fixed typo here
            columnsConfig={columns}
            exportEndPoint={config.exportUrl}
            deleteEndPoint={config.deleteUrl}
            deleteType="PD"
            trashView={`${ADMIN_TRASH}?trashof=${trashOf}`} // Pass proper URL
            createAction={action}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default Trash;
