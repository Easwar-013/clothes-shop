import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const { email, productId, productName } = await req.json();

    if (!email || !productId) {
      return NextResponse.json(
        { success: false, error: 'Email and Product ID are required' },
        { status: 400 }
      );
    }

    // Send confirmation email to the user
    await resend.emails.send({
      from: 'Attire Store <onboarding@resend.dev>', // Change to your domain when verified
      to: email,
      subject: `Restock Alert: ${productName || 'Your Item'}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2>We've got you covered!</h2>
          <p>You requested a restock notification for <strong>${productName}</strong>.</p>
          <p>We'll send you an email the moment this item is back in stock in our catalog.</p>
          <br/>
          <p>Thanks for shopping with <strong>Attire</strong>!</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: 'Stock alert email sent!' });
  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}