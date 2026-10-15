process.env.NODE_ENV = 'test';
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('./index');
const Customer = require('./models/customer.model');
const Product = require('./models/product.model');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

dotenv.config();

async function runWishlistTests() {
  console.log('--- Starting Backend Wishlist API Tests (Lab-04) ---');
  await mongoose.connect(process.env.MONGO_URI);

  let testUser;
  let testToken;
  let sampleProduct;

  try {
    // Setup test user & token
    const testEmail = `wishlist_test_${Date.now()}@example.com`;
    testUser = await Customer.create({
      fullName: 'Wishlist Tester',
      email: testEmail,
      password: 'hashedPassword123',
      phone: '9876543210',
      wishlist: []
    });

    testToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Pick a real product from DB
    sampleProduct = await Product.findOne();
    if (!sampleProduct) {
      throw new Error('No products in database to test with. Run seed first.');
    }

    const productId = sampleProduct._id.toString();

    // 1. Test Unauthenticated access
    console.log('\n1. Test: Unauthenticated GET /wishlist (Expected: 401)');
    const unauthRes = await request(app).get('/wishlist');
    console.log('Status:', unauthRes.status, '| Message:', unauthRes.body.message);
    if (unauthRes.status !== 401) throw new Error('Expected 401 for unauthenticated request');

    // 2. Test Add product to wishlist (POST /wishlist/:productId)
    console.log('\n2. Test: Add Product to Wishlist (POST /wishlist/:productId -> 200)');
    const addRes = await request(app)
      .post(`/wishlist/${productId}`)
      .set('Cookie', [`token=${testToken}`]);
    console.log('Status:', addRes.status, '| Message:', addRes.body.message);
    if (addRes.status !== 200 || !addRes.body.success) throw new Error('Failed to add product to wishlist');

    // 3. Test Duplicate add to wishlist (Expected: 409 Conflict)
    console.log('\n3. Test: Duplicate Add (POST /wishlist/:productId -> Expected: 409 Conflict)');
    const dupRes = await request(app)
      .post(`/wishlist/${productId}`)
      .set('Cookie', [`token=${testToken}`]);
    console.log('Status:', dupRes.status, '| Message:', dupRes.body.message);
    if (dupRes.status !== 409) throw new Error('Expected 409 for duplicate wishlist addition');

    // 4. Test Add with invalid product ID format (Expected: 400 Bad Request)
    console.log('\n4. Test: Invalid Product ID format (Expected: 400)');
    const invalidIdRes = await request(app)
      .post('/wishlist/invalid123')
      .set('Cookie', [`token=${testToken}`]);
    console.log('Status:', invalidIdRes.status, '| Message:', invalidIdRes.body.message);
    if (invalidIdRes.status !== 400) throw new Error('Expected 400 for invalid ID');

    // 5. Test Add non-existent product (Expected: 404 Not Found)
    console.log('\n5. Test: Non-existent Product ID (Expected: 404)');
    const notFoundRes = await request(app)
      .post('/wishlist/66d123abc456789012345678')
      .set('Cookie', [`token=${testToken}`]);
    console.log('Status:', notFoundRes.status, '| Message:', notFoundRes.body.message);
    if (notFoundRes.status !== 404) throw new Error('Expected 404 for non-existent product');

    // 6. Test Get current user's wishlist (GET /wishlist -> populated items)
    console.log('\n6. Test: Get Current User Wishlist with populate (GET /wishlist -> 200)');
    const getRes = await request(app)
      .get('/wishlist')
      .set('Cookie', [`token=${testToken}`]);
    console.log('Status:', getRes.status, '| Count:', getRes.body.count, '| First Item Name:', getRes.body.wishlist?.[0]?.name);
    if (getRes.status !== 200 || getRes.body.count !== 1 || !getRes.body.wishlist?.[0]?.price) {
      throw new Error('Failed to get populated wishlist');
    }

    // 7. Test Remove product from wishlist (DELETE /wishlist/:productId -> 200)
    console.log('\n7. Test: Remove Product from Wishlist (DELETE /wishlist/:productId -> 200)');
    const removeRes = await request(app)
      .delete(`/wishlist/${productId}`)
      .set('Cookie', [`token=${testToken}`]);
    console.log('Status:', removeRes.status, '| Message:', removeRes.body.message);
    if (removeRes.status !== 200 || !removeRes.body.success) throw new Error('Failed to remove product from wishlist');

    // 8. Test Remove non-wishlisted product (Expected: 404 Not Found)
    console.log('\n8. Test: Remove Already Removed Product (Expected: 404)');
    const removeAgainRes = await request(app)
      .delete(`/wishlist/${productId}`)
      .set('Cookie', [`token=${testToken}`]);
    console.log('Status:', removeAgainRes.status, '| Message:', removeAgainRes.body.message);
    if (removeAgainRes.status !== 404) throw new Error('Expected 404 for removing non-wishlisted product');

    // 9. Test Toggle Wishlist (PATCH /wishlist/:productId/toggle)
    console.log('\n9. Test: Toggle Wishlist (PATCH /wishlist/:productId/toggle)');
    const toggleAdd = await request(app)
      .patch(`/wishlist/${productId}/toggle`)
      .set('Cookie', [`token=${testToken}`]);
    console.log('Toggle 1 (Add): Status:', toggleAdd.status, '| Saved:', toggleAdd.body.saved);
    if (toggleAdd.status !== 200 || toggleAdd.body.saved !== true) throw new Error('Toggle add failed');

    const toggleRemove = await request(app)
      .patch(`/wishlist/${productId}/toggle`)
      .set('Cookie', [`token=${testToken}`]);
    console.log('Toggle 2 (Remove): Status:', toggleRemove.status, '| Saved:', toggleRemove.body.saved);
    if (toggleRemove.status !== 200 || toggleRemove.body.saved !== false) throw new Error('Toggle remove failed');

    console.log('\n--- ALL WISHLIST BACKEND TESTS PASSED 100%! ---');
  } finally {
    if (testUser) {
      await Customer.findByIdAndDelete(testUser._id);
    }
    await mongoose.disconnect();
  }
}

runWishlistTests().catch((err) => {
  console.error('Wishlist test failed:', err);
  process.exit(1);
});
