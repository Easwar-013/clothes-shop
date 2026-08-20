import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import StockAlert from '@/models/StockAlert';
import nodemailer from 'nodemailer';

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

    // 1. Upsert in DB & ensure notified is reset to false
    await StockAlert.findOneAndUpdate(
      { email: cleanEmail, productId: String(productId) },
      {
        email: cleanEmail,
        productId: String(productId),
        productName: productName || 'Your Item',
        notified: false,
      },
      { upsert: true, new: true }
    );

    // 2. Validate environment variables exist
    const gmailUser = process.env.GMAIL_USER?.trim();
    const gmailPass = process.env.GMAIL_APP_PASS?.trim().replace(/\s+/g, '');

    if (!gmailUser || !gmailPass) {
      console.error('Missing GMAIL_USER or GMAIL_APP_PASS in environment variables.');
      return NextResponse.json(
        { success: false, error: 'Email server configuration is missing.' },
        { status: 500 }
      );
    }

    // 3. Configure direct SSL Transporter (Vercel-compatible)
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // Use SSL
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    // 4. Send Confirmation Email
    await transporter.sendMail({
      from: `"ATTIRE." <${gmailUser}>`,
      to: cleanEmail,
      subject: `Restock Alert Registered: ${productName || 'Your Item'}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; color: #1f2937; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px;">
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

    return NextResponse.json({ success: true, message: 'Subscribed to stock alert!' });
  } catch (error) {
    console.error('Stock Alert API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to register stock alert' },
      { status: 500 }
    );
  }
}