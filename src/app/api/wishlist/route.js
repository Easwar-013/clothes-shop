import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Wishlist from '@/models/Wishlist';

export async function GET(req) {
  await connectDB();
  const userId = req.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  let wishlist = await Wishlist.findOne({ userId }).populate('products');
  return NextResponse.json({ success: true, products: wishlist?.products || [] });
}

export async function POST(req) {
  await connectDB();
  const { productId } = await req.json();
  const userId = req.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  let wishlist = await Wishlist.findOne({ userId });
  if (!wishlist) {
    wishlist = await Wishlist.create({ userId, products: [productId] });
  } else {
    const exists = wishlist.products.includes(productId);
    if (exists) {
      wishlist.products = wishlist.products.filter((id) => id.toString() !== productId);
    } else {
      wishlist.products.push(productId);
    }
    await wishlist.save();
  }

  return NextResponse.json({ success: true, wishlist: wishlist.products });
}