import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Message from '@/models/Message';

export async function POST(req) {
  try {
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please sign in first.' },
        { status: 401 }
      );
    }

    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'All fields are required.' },
        { status: 400 }
      );
    }

    await dbConnect();

    const newMessage = await Message.create({
      user: session.user.id || session.user.email,
      name,
      email,
      subject,
      message,
      status: 'New',
    });

    return NextResponse.json({ success: true, message: newMessage }, { status: 201 });
  } catch (error) {
    console.error('Contact Submission API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}