import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Coupon from '@/models/Coupon';

export async function POST(req) {
  try {
    await connectDB();
    const { code, subtotal } = await req.json();

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Please enter a coupon code.' },
        { status: 400 }
      );
    }

    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: 'Invalid or inactive promo code.' },
        { status: 404 }
      );
    }

    // Check expiration date
    if (new Date() > new Date(coupon.expiresAt)) {
      return NextResponse.json(
        { success: false, error: 'This promo code has expired.' },
        { status: 400 }
      );
    }

    // Check minimum order subtotal requirement
    if (Number(subtotal) < coupon.minOrderAmount) {
      return NextResponse.json(
        {
          success: false,
          error: `Minimum subtotal of ₹${coupon.minOrderAmount.toLocaleString('en-IN')} required for this code.`,
        },
        { status: 400 }
      );
    }

    const discountAmount = Number(
      ((subtotal * coupon.discountPercent) / 100).toFixed(2)
    );

    return NextResponse.json({
      success: true,
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      discountAmount,
    });
  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}