import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import StockAlert from '@/models/StockAlert';

export async function POST(req) {
  await connectDB();
  const { productId, email } = await req.json();

  if (!productId || !email) {
    return NextResponse.json({ success: false, error: 'Missing details.' }, { status: 400 });
  }

  await StockAlert.create({ productId, email });
  return NextResponse.json({ success: true, message: "We'll notify you when back in stock!" });
}