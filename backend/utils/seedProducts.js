const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');
const Product = require('../models/product.model');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

dotenv.config();

const sampleProducts = [
  {
    name: 'Mechanical Keyboard',
    description: 'RGB mechanical keyboard with tactile blue switches, detachable Type-C cable, and ergonomic aluminum frame.',
    price: 2999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    stock: 15
  },
  {
    name: 'Noise Cancelling Headphones',
    description: 'Wireless over-ear headphones with active noise cancellation, 40-hour battery life, and crystal clear acoustic drivers.',
    price: 4999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    stock: 25
  },
  {
    name: 'Ultra HD 4K Monitor',
    description: '27-inch 4K IPS display with HDR400, 99% sRGB color gamut, and ultra-slim bezel for immersive creative workflows.',
    price: 24999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
    stock: 8
  },
  {
    name: 'Wireless Ergonomic Mouse',
    description: 'Precision optical mouse with multi-device Bluetooth switching, customizable thumb scroll, and silent click buttons.',
    price: 1899,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80',
    stock: 30
  },
  {
    name: 'Classic Denim Jacket',
    description: 'Timeless vintage wash denim jacket made from 100% sustainable organic cotton with rugged metal hardware.',
    price: 3499,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80',
    stock: 18
  },
  {
    name: 'Running Performance Sneakers',
    description: 'Lightweight breathable mesh running shoes with responsive foam cushioning and high-traction rubber outsole.',
    price: 4299,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
    stock: 12
  },
  {
    name: 'Minimalist Leather Wallet',
    description: 'Slim bifold wallet crafted from genuine full-grain leather with RFID blocking technology and 8 card slots.',
    price: 1299,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80',
    stock: 40
  },
  {
    name: 'Atomic Habits by James Clear',
    description: 'An easy & proven way to build good habits and break bad ones. The definitive masterclass on personal growth.',
    price: 599,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&auto=format&fit=crop&q=80',
    stock: 50
  },
  {
    name: 'Clean Code by Robert C. Martin',
    description: 'A handbook of agile software craftsmanship. Master the principles, patterns, and practices of writing clean, maintainable code.',
    price: 1199,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1532012164546-f432f2e37262?w=800&auto=format&fit=crop&q=80',
    stock: 22
  },
  {
    name: 'Smart Ceramic Coffee Mug',
    description: 'Temperature-controlled smart mug that keeps your beverage at your preferred drinking temperature for up to 1.5 hours.',
    price: 3299,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
    stock: 14
  },
  {
    name: 'Aroma Diffuser & Humidifier',
    description: 'Ultrasonic cool mist essential oil diffuser with 7 ambient LED colors and automatic shut-off safety protection.',
    price: 1699,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80',
    stock: 20
  },
  {
    name: 'Ergonomic Memory Foam Pillow',
    description: 'Contoured orthopedic cervical pillow designed for superior neck and spinal alignment during sleep.',
    price: 2199,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&auto=format&fit=crop&q=80',
    stock: 16
  }
];

const seedProducts = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    console.log('Clearing existing products...');
    await Product.deleteMany({});

    console.log('Inserting sample products...');
    const created = await Product.insertMany(sampleProducts);
    console.log(`Successfully seeded ${created.length} products!`);

    process.exit(0);
  } catch (err) {
    console.error('Failed to seed products:', err);
    process.exit(1);
  }
};

if (require.main === module) {
  seedProducts();
}

module.exports = { sampleProducts, seedProducts };
