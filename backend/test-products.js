process.env.NODE_ENV = 'test';
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');
const request = require('supertest');
const app = require('./index');
const Product = require('./models/product.model');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

dotenv.config();

async function runTests() {
  console.log('--- Starting Backend Product API Tests ---');
  await mongoose.connect(process.env.MONGO_URI);

  try {
    // 1. POST /products - Success
    console.log('\n1. Test: Create Product (Valid Data)');
    const createRes = await request(app)
      .post('/products')
      .send({
        name: 'Test Mechanical Numpad',
        description: 'Compact wireless mechanical numpad for accountants and gamers.',
        price: 1499,
        category: 'Electronics',
        image: 'https://example.com/numpad.jpg',
        stock: 10
      });
    console.log('Status:', createRes.status, '| Success:', createRes.body.success, '| ID:', createRes.body.product?._id);
    if (createRes.status !== 201 || !createRes.body.product?._id) throw new Error('Failed to create product');

    const createdId = createRes.body.product._id;

    // 2. POST /products - Missing required field
    console.log('\n2. Test: Create Product (Missing Category -> 400)');
    const missingRes = await request(app)
      .post('/products')
      .send({
        name: 'Incomplete Product',
        description: 'Missing category and image',
        price: 999,
        stock: 5
      });
    console.log('Status:', missingRes.status, '| Message:', missingRes.body.message);
    if (missingRes.status !== 400) throw new Error('Expected 400 for missing field');

    // 3. POST /products - Invalid price
    console.log('\n3. Test: Create Product (Invalid Price <= 0 -> 400)');
    const invalidPriceRes = await request(app)
      .post('/products')
      .send({
        name: 'Zero Price Product',
        description: 'Free item invalid',
        price: 0,
        category: 'Electronics',
        image: 'https://example.com/item.jpg',
        stock: 5
      });
    console.log('Status:', invalidPriceRes.status, '| Message:', invalidPriceRes.body.message);
    if (invalidPriceRes.status !== 400) throw new Error('Expected 400 for invalid price');

    // 4. POST /products - Invalid stock
    console.log('\n4. Test: Create Product (Negative Stock -> 400)');
    const invalidStockRes = await request(app)
      .post('/products')
      .send({
        name: 'Negative Stock Item',
        description: 'Negative stock item',
        price: 500,
        category: 'Electronics',
        image: 'https://example.com/item.jpg',
        stock: -3
      });
    console.log('Status:', invalidStockRes.status, '| Message:', invalidStockRes.body.message);
    if (invalidStockRes.status !== 400) throw new Error('Expected 400 for invalid stock');

    // 5. GET /products - Get all
    console.log('\n5. Test: Get All Products (GET /products)');
    const allRes = await request(app).get('/products');
    console.log('Status:', allRes.status, '| Count:', allRes.body.count, '| IsArray:', Array.isArray(allRes.body.products));
    if (allRes.status !== 200 || !Array.isArray(allRes.body.products)) throw new Error('Failed to get all products');

    // 6. GET /products?search=keyboard - Case-insensitive search
    console.log('\n6. Test: Search Products (GET /products?search=keyboard)');
    const searchRes = await request(app).get('/products?search=keyboard');
    console.log('Status:', searchRes.status, '| Count:', searchRes.body.count);
    const searchMatches = searchRes.body.products.every(p => p.name.toLowerCase().includes('keyboard'));
    console.log('All results contain "keyboard":', searchMatches);
    if (searchRes.status !== 200 || !searchMatches) throw new Error('Search failed');

    // 7. GET /products?category=Electronics - Category filter
    console.log('\n7. Test: Category Filter (GET /products?category=Electronics)');
    const catRes = await request(app).get('/products?category=Electronics');
    console.log('Status:', catRes.status, '| Count:', catRes.body.count);
    const catMatches = catRes.body.products.every(p => p.category.toLowerCase() === 'electronics');
    console.log('All results are category "Electronics":', catMatches);
    if (catRes.status !== 200 || !catMatches) throw new Error('Category filter failed');

    // 8. GET /products?search=keyboard&category=Electronics - Combined search & filter
    console.log('\n8. Test: Combined Filter (GET /products?search=keyboard&category=Electronics)');
    const combRes = await request(app).get('/products?search=keyboard&category=Electronics');
    console.log('Status:', combRes.status, '| Count:', combRes.body.count);
    if (combRes.status !== 200) throw new Error('Combined filter failed');

    // 9. GET /products?sort=price_asc & sort=price_desc - Bonus sorting
    console.log('\n9. Test: Sorting (GET /products?sort=price_asc)');
    const sortAscRes = await request(app).get('/products?sort=price_asc');
    const prices = sortAscRes.body.products.map(p => p.price);
    const isSortedAsc = prices.every((val, i, arr) => !i || arr[i - 1] <= val);
    console.log('Prices sorted asc:', isSortedAsc, '| Sample prices:', prices.slice(0, 5));
    if (!isSortedAsc) throw new Error('Ascending sort failed');

    // 10. GET /products/:id - Valid ID
    console.log('\n10. Test: Get Single Product (GET /products/:id)');
    const singleRes = await request(app).get(`/products/${createdId}`);
    console.log('Status:', singleRes.status, '| Product Name:', singleRes.body.product?.name);
    if (singleRes.status !== 200 || singleRes.body.product?._id !== createdId) throw new Error('Get single product failed');

    // 11. GET /products/:id - Invalid ID format -> 400
    console.log('\n11. Test: Get Product with Invalid ID format (GET /products/123invalid)');
    const invalidIdRes = await request(app).get('/products/123invalid');
    console.log('Status:', invalidIdRes.status, '| Message:', invalidIdRes.body.message);
    if (invalidIdRes.status !== 400) throw new Error('Expected 400 for invalid ID format');

    // 12. GET /products/:id - Non-existent ID -> 404
    console.log('\n12. Test: Get Product with Non-existent ID (GET /products/66d123abc456789012345678)');
    const notFoundRes = await request(app).get('/products/66d123abc456789012345678');
    console.log('Status:', notFoundRes.status, '| Message:', notFoundRes.body.message);
    if (notFoundRes.status !== 404) throw new Error('Expected 404 for not found product');

    // Cleanup test product
    await Product.findByIdAndDelete(createdId);
    console.log('\n--- ALL 12 BACKEND TESTS PASSED SUCCESSFULLY! ---');
  } finally {
    await mongoose.disconnect();
  }
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
