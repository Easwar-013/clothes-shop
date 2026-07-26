import 'dotenv/config';

import dbConnect from './db.js';
import Product from '../models/Product.js';

const sampleProducts = [
  {
    title: 'Classic Vintage Denim Jacket',
    description: 'A timeless vintage-wash denim jacket made from 100% durable cotton. Features buttoned chest pockets and adjustable side tabs.',
    price: 89.99,
    category: 'Jackets',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Blue', 'Washed Black'],
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop'],
    stock: 25,
    isFeatured: true,
  },
  {
    title: 'Minimalist Oxford Cotton Shirt',
    description: 'Crisp, breathable button-down Oxford shirt designed for both casual weekends and smart workplace attire.',
    price: 49.99,
    category: 'Shirts',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['White', 'Light Blue'],
    images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop'],
    stock: 40,
    isFeatured: true,
  },
  {
    title: 'Elegant Floral Summer Wrap Dress',
    description: 'Lightweight midi dress featuring a soft floral pattern, wrap silhouette, and adjustable waist tie.',
    price: 69.99,
    category: 'Dresses',
    sizes: ['S', 'M', 'L'],
    colors: ['Floral Pink', 'Cream'],
    images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop'],
    stock: 18,
    isFeatured: true,
  },
  {
    title: 'Tailored Slim-Fit Chino Pants',
    description: 'Versatile stretch-cotton chinos crafted for maximum flexibility and comfort throughout the day.',
    price: 59.99,
    category: 'Pants',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Khaki', 'Navy', 'Olive'],
    images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop'],
    stock: 30,
    isFeatured: false,
  },
  {
    title: 'Heavyweight Fleece Pullover Hoodie',
    description: 'Ultra-soft cotton blend hoodie with double-layer hood and kangaroo pocket. Perfect for cold weather layering.',
    price: 64.99,
    category: 'Hoodies',
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['Heather Grey', 'Black'],
    images: ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop'],
    stock: 22,
    isFeatured: true,
  },
];

async function seedDatabase() {
  try {
    await dbConnect();
    console.log('Connected to MongoDB for seeding...');

    await Product.deleteMany({});
    console.log('Cleared existing product catalog.');

    await Product.insertMany(sampleProducts);
    console.log('Successfully seeded sample products into catalog!');

    process.exit(0);
  } catch (error) {
    console.error('Failed to seed database:', error);
    process.exit(1);
  }
}

seedDatabase();