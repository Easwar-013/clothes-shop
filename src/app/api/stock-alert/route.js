import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import StockAlert from '@/models/StockAlert';
import nodemailer from 'nodemailer';

// Configure standard Gmail SMTP transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS,
  },
});

export async function POST(req) {
  try {
    await dbConnect();
    const { email, productId, productName } = await req.json();

    if (!email || !productId) {
      return NextResponse.json(
        { success: false, error: 'Email and Product ID are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Prevent duplicate entries for the same user and product
    await StockAlert.findOneAndUpdate(
      { email: cleanEmail, productId },
      {
        email: cleanEmail,
        productId,
        productName: productName || 'Your Item',
      },
      { upsert: true, new: true }
    );

    // Send confirmation email to ANY email address
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASS) {
      try {
        await transporter.sendMail({
          from: `"ATTIRE." <${process.env.GMAIL_USER}>`,
          to: cleanEmail,
          subject: `Restock Alert Registered: ${productName || 'Your Item'}`,
          html: `
            <div style="font-family: sans-serif; padding: 24px; color: #1f2937; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px;">
              <h2 style="color: #4f46e5; margin-bottom: 8px;">We've Got You Covered!</h2>
              <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">
                You requested a restock notification for <strong>${productName || 'Your Item'}</strong>.
              </p>
              <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">
                We'll email you the moment this item is replenished in our store catalog.
              </p>
              <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 20px 0;" />
              <p style="font-size: 12px; color: #9ca3af;">
                Thanks for shopping with <strong>ATTIRE.</strong>
              </p>
            </div>
          `,
        });
      } catch (mailErr) {
        console.error('Nodemailer Send Error:', mailErr);
      }
    }

    return NextResponse.json({ success: true, message: 'Subscribed to stock alert!' });
  } catch (error) {
    console.error('Stock Alert Database Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}