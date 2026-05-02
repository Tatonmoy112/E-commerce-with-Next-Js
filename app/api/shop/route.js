import { connectDB } from "@/lib/db";
import { catchError, response } from "@/lib/helperFunction";


export async function GET(request) {
  try {    
    await connectDB();

    const searchParams = request.nextUrl.searchParams
    
    // get filters from query params

    const size = searchParams.get('size')
    const color = searchParams.get('color')
    const minPrice = pareseInt(searchParams.get('minPrice')) || 0
    const maxPrice = pareseInt(searchParams.get('maxPrice')) || 0
    const category = searchParams.get('category')
    const search = searchParams.get('q')

    // pagination
    const limit = pareseInt(searchParams.get('limit')) || 9
    const page = pareseInt(searchParams.get('page')) || 0
    const skip = page* limit 

    // sorting 

    const sortOption = searchParams.get('sort') || 'default_sorting'
    let sortquery = {}
    if (sortOption == 'default_sorting') sortquery= {createdAr:-1}
    if (sortOption == 'asc') sortquery= {name:1}
    if (sortOption == 'desc') sortquery= {name:1}
    if (sortOption == 'price_low_high') sortquery= {sellingPrice:1}
    if (sortOption == 'price_high_low') sortquery= {sellingPrice:-1}


    // find category by slug 

    

   
  } catch (error) {
    return catchError(error);
  }
}
