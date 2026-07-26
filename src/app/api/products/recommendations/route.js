import { NextResponse } from 'next/server';
import connectDB from '@/lib/db'; // Adjust path
import Product from '@/models/Product'; // Adjust path

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    const productId = searchParams.get('id');
    const category = searchParams.get('category');
    const basePrice = Number(searchParams.get('price')) || 0;

    if (!productId) {
      return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 });
    }

    // Define price margin (+/- 30% of current product price)
    const minPrice = Math.max(0, basePrice * 0.7);
    const maxPrice = basePrice * 1.3;

    // Query 1: Same category, similar price, excluding current product
    let recommendations = await Product.find({
      _id: { $ne: productId },
      category: category,
      price: { $gte: minPrice, $lte: maxPrice },
    }).limit(6);

    // Query 2: Fallback if less than 6 items found — get any items in similar price range
    if (recommendations.length < 6) {
      const existingIds = [productId, ...recommendations.map((p) => p._id.toString())];
      
      const fallbackProducts = await Product.find({
        _id: { $nin: existingIds },
        price: { $gte: minPrice, $lte: maxPrice },
      }).limit(6 - recommendations.length);

      recommendations = [...recommendations, ...fallbackProducts];
    }

    return NextResponse.json({ success: true, products: recommendations });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}