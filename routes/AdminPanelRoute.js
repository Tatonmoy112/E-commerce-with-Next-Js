export const ADMIN_DASHBOARD = '/admin/dashboard'

// Media routes
export const ADMIN_MEDIA_SHOW = '/admin/media'
export const ADMIN_MEDIA_EDIT = (id)=> id?  `/admin/media/edit/${id}` : ''

// Category Routes

export const ADMIN_CATEGORY_ADD = '/admin/category/add'
export const ADMIN_CATEGORY_SHOW = '/admin/category'
export const ADMIN_CATEGORY_EDIT = (id)=> id?  `/admin/category/edit/${id}` : ''


// Trash route

export const ADMIN_TRASH = '/admin/trash'
// export const ADMIN_TRASH_PRODUCT = '/admin/product/trash'


// Product

export const ADMIN_PRODUCT_ADD = '/admin/product/add'
export const ADMIN_PRODUCT_SHOW = '/admin/product'
export const ADMIN_PRODUCT_EDIT = (id)=> id?  `/admin/product/edit/${id}` : ''
// Product Variant

export const ADMIN_PRODUCT_VARIANT_ADD = '/admin/product-variant/add'
export const ADMIN_PRODUCT_VARIANT_SHOW = '/admin/product-variant'
export const ADMIN_PRODUCT_VARIANT_EDIT = (id)=> id?  `/admin/product-variant/edit/${id}` : ''


// Cupon Routes

export const ADMIN_CUPON_ADD = '/admin/cupon/add'
export const ADMIN_CUPON_SHOW = '/admin/cupon'
export const ADMIN_CUPON_EDIT = (id)=> id?  `/admin/cupon/edit/${id}` : ''


// customers
export const ADMIN_CUSTOMERS_SHOW = '/admin/customers'

//review 

export const ADMIN_REVIEW_SHOW = '/admin/review'