'use client';

import { usePathname } from 'next/navigation';
import EditProductVariant from './EditProductVariant';

export default function Page() {
  const pathname = usePathname(); // e.g., "/admin/product-variant/edit/692e7fc17fb7b79299961ab7"
  const id = pathname.split('/').pop(); // last segment is the ID

  console.log('ID from path:', id);

  if (!id) return <p>No Product Variant ID found!</p>;

  return <EditProductVariant id={id} />;
}
