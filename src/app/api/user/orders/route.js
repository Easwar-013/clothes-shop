import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db'; // Adjust to your DB connection file path
import Order from '@/models/Order'; // Adjust to your Order model path
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Adjust if authOptions is located elsewhere

export async function GET(request) {
  try {
    await connectDB();

    // 1. Try getting session from NextAuth
    const session = await getServerSession(authOptions);
    
    // 2. Fallback to header if passed manually from frontend
    const headerEmail = request.headers.get('x-user-email');
    const headerUserId = request.headers.get('x-user-id');

    const userEmail = session?.user?.email || headerEmail;
    const userId = session?.user?.id || session?.user?._id || headerUserId;

    if (!userEmail && !userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: User missing' },
        { status: 401 }
      );
    }

    // 3. Query MongoDB for orders matching userEmail OR user ObjectId
    const query = {
      $or: [],
    };

    if (userEmail) {
      query.$or.push({ userEmail: userEmail });
    }
    if (userId) {
      query.$or.push({ user: userId });
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}