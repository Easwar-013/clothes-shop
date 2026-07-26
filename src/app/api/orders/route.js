import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();

    const { items, totalAmount, shippingAddress, paymentMethod, user, userName, userEmail } = body;

    if (!items || !Array.isArray(items) || items.length === 0 || !totalAmount || !shippingAddress) {
      return NextResponse.json(
        { success: false, error: 'Missing required order details.' },
        { status: 400 }
      );
    }

    // Resolve MongoDB User document
    let foundUser = null;

    if (user && typeof user === 'string' && user.match(/^[0-9a-fA-F]{24}$/)) {
      foundUser = await User.findById(user);
    }

    if (!foundUser && (userEmail || user)) {
      foundUser = await User.findOne({ email: userEmail || user });
    }

    // Convert string ID into a native MongoDB ObjectId if available
    let resolvedUserId = '650000000000000000000000';
    if (foundUser) {
      resolvedUserId = foundUser._id;
    } else if (user && typeof user === 'string' && user.match(/^[0-9a-fA-F]{24}$/)) {
      resolvedUserId = new mongoose.Types.ObjectId(user);
    }

    const resolvedName = foundUser ? foundUser.name : (userName || 'Customer');
    const resolvedEmail = foundUser ? foundUser.email : (userEmail || shippingAddress?.phone || '');

    // Sanitize items
    const sanitizedItems = items.map((item) => ({
      product: item.product || item._id || '650000000000000000000000',
      title: item.title || 'Product',
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
      size: item.size || 'M',
      color: item.color || 'Default',
    }));

    const normalizedShippingAddress = {
      phone: shippingAddress?.phone || '',
      street: shippingAddress?.street || '',
      city: shippingAddress?.city || '',
      state: shippingAddress?.state || '',
      zipCode: shippingAddress?.zipCode || '',
      country: shippingAddress?.country || 'India',
    };

    const newOrder = await Order.create({
      user: resolvedUserId,
      userName: resolvedName,
      userEmail: resolvedEmail,
      items: sanitizedItems,
      totalAmount: Number(totalAmount) || 0,
      shippingAddress: normalizedShippingAddress,
      paymentMethod: paymentMethod || 'Standard Test Payment',
      isPaid: true,
      status: 'Pending',
    });

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error) {
    console.error('API Orders POST Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    let query = {};
    if (userId) {
      query.user = userId;
    }

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, orders }, { status: 200 });
  } catch (error) {
    console.error('API Orders GET Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}