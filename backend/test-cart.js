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

async function runCartTests() {
  console.log('--- Starting Backend Cart API Tests (Lab-05) ---');
  await mongoose.connect(process.env.MONGO_URI);

  let testUser;
  let testToken;
  let sampleProduct;

  try {
    // Setup test user & token
    const testEmail = `cart_test_${Date.now()}@example.com`;
    testUser = await Customer.create({
      fullName: 'Cart Tester',
      email: testEmail,
      password: 'hashedPassword123',
      phone: '9876543210',
      cart: []
    });

    testToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    sampleProduct = await Product.findOne({ stock: { $gte: 5 } });
    if (!sampleProduct) {
      throw new Error('No product with stock >= 5 found in database.');
    }

    const productId = sampleProduct._id.toString();

    // 1. Unauthenticated GET /cart -> 401
    console.log('\n1. Test: Unauthenticated GET /cart (Expected: 401)');
    const unauthRes = await request(app).get('/cart');
    console.log('Status:', unauthRes.status, '| Message:', unauthRes.body.message);
    if (unauthRes.status !== 401) throw new Error('Expected 401 for unauthenticated cart request');

    // 2. Add new item to cart -> quantity 1
    console.log('\n2. Test: Add Item to Cart (POST /cart/:productId -> quantity 1)');
    const add1Res = await request(app)
      .post(`/cart/${productId}`)
      .set('Cookie', [`token=${testToken}`])
      .send({ quantity: 1 });
    console.log('Status:', add1Res.status, '| Cart Items Count:', add1Res.body.cart?.length, '| Quantity:', add1Res.body.cart?.[0]?.quantity);
    if (add1Res.status !== 200 || add1Res.body.cart?.[0]?.quantity !== 1) throw new Error('Failed to add item with quantity 1');

    // 3. Add same item again -> increments quantity to 2
    console.log('\n3. Test: Add Same Item Again (POST /cart/:productId -> quantity 2)');
    const add2Res = await request(app)
      .post(`/cart/${productId}`)
      .set('Cookie', [`token=${testToken}`])
      .send({ quantity: 1 });
    console.log('Status:', add2Res.status, '| Cart Rows:', add2Res.body.cart?.length, '| Quantity:', add2Res.body.cart?.[0]?.quantity);
    if (add2Res.status !== 200 || add2Res.body.cart?.length !== 1 || add2Res.body.cart?.[0]?.quantity !== 2) {
      throw new Error('Failed to increment quantity on duplicate add');
    }

    // 4. Get Cart -> Populated Product
    console.log('\n4. Test: Get Cart (GET /cart -> Populated Product)');
    const getRes = await request(app)
      .get('/cart')
      .set('Cookie', [`token=${testToken}`]);
    console.log('Status:', getRes.status, '| Product Name:', getRes.body.cart?.[0]?.product?.name, '| Price:', getRes.body.cart?.[0]?.product?.price);
    if (getRes.status !== 200 || !getRes.body.cart?.[0]?.product?.name || !getRes.body.cart?.[0]?.product?.price) {
      throw new Error('Failed to get populated cart');
    }

    // 5. Update quantity -> quantity 3
    console.log('\n5. Test: Update Quantity (PATCH /cart/:productId -> quantity 3)');
    const updateRes = await request(app)
      .patch(`/cart/${productId}`)
      .set('Cookie', [`token=${testToken}`])
      .send({ quantity: 3 });
    console.log('Status:', updateRes.status, '| Updated Quantity:', updateRes.body.cart?.[0]?.quantity);
    if (updateRes.status !== 200 || updateRes.body.cart?.[0]?.quantity !== 3) {
      throw new Error('Failed to update cart quantity');
    }

    // 6. Exceed Stock -> 400 Bad Request
    console.log('\n6. Test: Exceed Stock Limit (PATCH /cart/:productId with qty 9999 -> Expected: 400)');
    const exceedRes = await request(app)
      .patch(`/cart/${productId}`)
      .set('Cookie', [`token=${testToken}`])
      .send({ quantity: 9999 });
    console.log('Status:', exceedRes.status, '| Message:', exceedRes.body.message);
    if (exceedRes.status !== 400) throw new Error('Expected 400 when exceeding stock');

    // 7. Quantity < 1 -> 400 Bad Request
    console.log('\n7. Test: Invalid Quantity < 1 (PATCH /cart/:productId with qty 0 -> Expected: 400)');
    const zeroQtyRes = await request(app)
      .patch(`/cart/${productId}`)
      .set('Cookie', [`token=${testToken}`])
      .send({ quantity: 0 });
    console.log('Status:', zeroQtyRes.status, '| Message:', zeroQtyRes.body.message);
    if (zeroQtyRes.status !== 400) throw new Error('Expected 400 for zero quantity');

    // 8. Remove item from cart -> DELETE /cart/:productId
    console.log('\n8. Test: Remove Item from Cart (DELETE /cart/:productId -> 200)');
    const removeRes = await request(app)
      .delete(`/cart/${productId}`)
      .set('Cookie', [`token=${testToken}`]);
    console.log('Status:', removeRes.status, '| Cart items remaining:', removeRes.body.cart?.length);
    if (removeRes.status !== 200 || removeRes.body.cart?.length !== 0) {
      throw new Error('Failed to remove item from cart');
    }

    // 9. Remove item not in cart -> 404
    console.log('\n9. Test: Remove Item Not in Cart (DELETE /cart/:productId -> Expected: 404)');
    const removeAgainRes = await request(app)
      .delete(`/cart/${productId}`)
      .set('Cookie', [`token=${testToken}`]);
    console.log('Status:', removeAgainRes.status, '| Message:', removeAgainRes.body.message);
    if (removeAgainRes.status !== 404) throw new Error('Expected 404 for removing item not in cart');

    console.log('\n--- ALL 9 CART BACKEND TESTS PASSED 100%! ---');
  } finally {
    if (testUser) {
      await Customer.findByIdAndDelete(testUser._id);
    }
    await mongoose.disconnect();
  }
}

runCartTests().catch((err) => {
  console.error('Cart test failed:', err);
  process.exit(1);
});
