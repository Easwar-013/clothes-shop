import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

// GET /api/admin/products - Fetch all products
export async function GET() {
  try {
    await dbConnect();
    const products = await Product.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, count: products.length, products });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/admin/products - Create a new product
export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();

    const { title, description, price, offer, category, sizes, colors, images, stock, isFeatured } = body;

    // Validation
    if (!title || !description || price == null || !category || !images || images.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Please fill in all required fields' },
        { status: 400 }
      );
    }

    const newProduct = await Product.create({
      title,
      description,
      price: Number(price) || 0,
      offer: offer != null && offer !== '' ? Number(offer) : 0,
      category,
      sizes: sizes || ['S', 'M', 'L'],
      colors: colors || [],
      images,
      stock: stock != null ? Number(stock) : 0,
      isFeatured: isFeatured || false,
    });

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT /api/admin/products - Update an existing product
export async function PUT(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required for updates' },
        { status: 400 }
      );
    }

    // Explicitly enforce numeric values
    if ('price' in updateData) {
      updateData.price = Number(updateData.price) || 0;
    }
    if ('offer' in updateData) {
      updateData.offer = updateData.offer !== '' && updateData.offer != null ? Number(updateData.offer) : 0;
    }
    if ('stock' in updateData) {
      updateData.stock = Number(updateData.stock) || 0;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/products - Delete a product
export async function DELETE(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}