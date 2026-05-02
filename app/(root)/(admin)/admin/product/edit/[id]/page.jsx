'use client';
import EditProduct from './EditProduct';

import { usePathname } from 'next/navigation';

export default function Page() {
  const pathname = usePathname(); // e.g., "/admin/product/edit/692c0cde6dce39e77f35f641"
  const id = pathname.split('/').pop(); // grab last segment
  console.log('ID from path:', id);
  return <EditProduct id={id} />;
}