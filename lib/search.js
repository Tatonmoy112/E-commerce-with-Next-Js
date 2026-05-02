import { ADMIN_CATEGORY_ADD, ADMIN_CATEGORY_SHOW, ADMIN_CUPON_ADD, ADMIN_CUPON_SHOW, ADMIN_CUSTOMERS_SHOW, ADMIN_DASHBOARD, ADMIN_MEDIA_SHOW, ADMIN_PRODUCT_ADD, ADMIN_PRODUCT_SHOW, ADMIN_PRODUCT_VARIANT_SHOW, ADMIN_REVIEW_SHOW } from "@/routes/AdminPanelRoute";



const searchData = [
   {
       label: "Dashboard",
       description: "View website analytics and reports",
       url: ADMIN_DASHBOARD,
       keywords: ["dashboard", "overview", "analytics", "insights"]
   },
   {
       label: "Category",
       description: "Manage product categories",
       url: ADMIN_CATEGORY_SHOW,
       keywords: ["category", "product category"]
   },
   {
       label: "Add Category",
       description: "Add new product categories",
       url: ADMIN_CATEGORY_ADD,
       keywords: ["add category", "new category"]
   },
   {
       label: "Product",
       description: "Manage all product listings",
       url: ADMIN_PRODUCT_SHOW,
       keywords: ["products", "product list"]
   },
   {
       label: "Add Product",
       description: "Add a new product to the catalog",
       url: ADMIN_PRODUCT_ADD,
       keywords: ["new product", "add product"]
   },
   {
       label: "Product Variant",
       description: "Manage all product variants",
       url: ADMIN_PRODUCT_VARIANT_SHOW,
       keywords: ["products variants", "variants"]
   },
   {
       label: "Coupon",
       description: "Manage active discount coupons",
       url: ADMIN_CUPON_SHOW,
       keywords: ["discount", "promo", "coupon"]
   },
   {
       label: "Add Coupon",
       description: "Create a new discount coupon",
       url: ADMIN_CUPON_ADD,
       keywords: ["add coupon", "new coupon", "promotion", "offers"]
   },
   {
       label: "Orders",
       description: "Manage customer orders",
       url:'',
       keywords: ["orders"]
   },
   {
       label: "Users",
       description: "View and manage user information",
       url: ADMIN_CUSTOMERS_SHOW,
       keywords: ["users", "users"]
   },
   {
       label: "Review",
       description: "Manage customer reviews and feedback",
       url: ADMIN_REVIEW_SHOW,
       keywords: ["ratings", "feedback"]
   },

   {
       label: "Media",
       description: "Manage website media files",
       url: ADMIN_MEDIA_SHOW,
       keywords: ["images", "videos"]
   },

];

export default searchData;


