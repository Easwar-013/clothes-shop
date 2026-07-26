import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Review from '@/models/Review';
import Order from '@/models/Order';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 });
    }

    const reviews = await Review.find({ productId }).sort({ createdAt: -1 });

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
        : 0;

    return NextResponse.json({
      success: true,
      reviews,
      totalReviews,
      averageRating: Number(averageRating),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const { productId, userEmail, userName, rating, comment, images } = await req.json();

    if (!productId || !userEmail || !rating || !comment) {
      return NextResponse.json(
        { success: false, error: 'All required fields must be filled.' },
        { status: 400 }
      );
    }

    const existingOrder = await Order.findOne({
      $or: [{ userEmail }, { user: userEmail }],
      'items.product': productId,
    });

    const newReview = await Review.create({
      productId,
      userEmail,
      userName: userName || 'Anonymous',
      rating: Number(rating),
      comment: comment.trim(),
      images: Array.isArray(images) ? images : [],
      isVerifiedBuyer: !!existingOrder,
    });

    return NextResponse.json({ success: true, review: newReview });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const reviewId = searchParams.get('id');

    if (!reviewId) {
      return NextResponse.json({ success: false, error: 'Review ID required' }, { status: 400 });
    }

    await Review.findByIdAndDelete(reviewId);
    return NextResponse.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}