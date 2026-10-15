process.env.NODE_ENV = 'test';
const crypto = require('crypto');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('./index');
const Customer = require('./models/customer.model');
const Product = require('./models/product.model');
const Order = require('./models/order.model');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

dotenv.config();

async function runOrderTests() {
  console.log('========================================================');
  console.log('--- Starting Backend Order & Razorpay Tests (Lab-06) ---');
  console.log('========================================================\n');

  await mongoose.connect(process.env.MONGO_URI);

  let userA, tokenA;
  let userB, tokenB;
  let testProduct;

  try {
    // 0. Setup test users and a product
    const timestamp = Date.now();
    userA = await Customer.create({
      fullName: 'Aarav Sharma',
      email: `aarav_${timestamp}@example.com`,
      password: 'hashedPassword123',
      phone: '9876543210',
      cart: []
    });
    tokenA = jwt.sign({ id: userA._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    userB = await Customer.create({
      fullName: 'Bhavna Patel',
      email: `bhavna_${timestamp}@example.com`,
      password: 'hashedPassword123',
      phone: '9876543211',
      cart: []
    });
    tokenB = jwt.sign({ id: userB._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    testProduct = await Product.create({
      name: `Mechanical Keyboard Test ${timestamp}`,
      description: 'RGB Backlit Gaming Keyboard',
      price: 2999,
      category: 'Electronics',
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3',
      stock: 5
    });

    console.log(`Created Test Product: "${testProduct.name}" | Stock: ${testProduct.stock} | Price: ₹${testProduct.price}`);

    // TEST 1 — Unauthenticated request
    console.log('\n[Test 1] Unauthenticated request to /orders (Expected: 401)');
    const unauthRes = await request(app).get('/orders');
    console.log('Status:', unauthRes.status, '| Success:', unauthRes.body.success);
    if (unauthRes.status !== 401) throw new Error('Expected 401 for unauthenticated GET /orders');

    // TEST 2 — Empty cart checkout
    console.log('\n[Test 2] Checkout with empty cart (Expected: 400 Bad Request)');
    const emptyCartRes = await request(app)
      .post('/orders/create-payment-order')
      .set('Cookie', [`token=${tokenA}`])
      .send({
        shippingAddress: {
          fullName: 'Aarav Sharma',
          phone: '9876543210',
          addressLine1: '22 MG Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560001'
        }
      });
    console.log('Status:', emptyCartRes.status, '| Message:', emptyCartRes.body.message);
    if (emptyCartRes.status !== 400) throw new Error('Expected 400 for empty cart checkout');

    // TEST 3 — Invalid Shipping Address
    console.log('\n[Test 3] Invalid shipping address validation (Expected: 400)');
    // Add 1 item to userA cart first
    userA.cart = [{ product: testProduct._id, quantity: 2 }];
    await userA.save();

    const invalidAddressRes = await request(app)
      .post('/orders/create-payment-order')
      .set('Cookie', [`token=${tokenA}`])
      .send({
        shippingAddress: {
          fullName: 'Aarav Sharma',
          phone: '123', // invalid phone
          addressLine1: '',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '1234' // invalid pincode
        }
      });
    console.log('Status:', invalidAddressRes.status, '| Message:', invalidAddressRes.body.message);
    if (invalidAddressRes.status !== 400) throw new Error('Expected 400 for invalid shipping address');

    // TEST 4 — Insufficient stock
    console.log('\n[Test 4] Insufficient stock check (Expected: 400)');
    userA.cart = [{ product: testProduct._id, quantity: 10 }]; // 10 requested, but stock is 5
    await userA.save();

    const outOfStockRes = await request(app)
      .post('/orders/create-payment-order')
      .set('Cookie', [`token=${tokenA}`])
      .send({
        shippingAddress: {
          fullName: 'Aarav Sharma',
          phone: '9876543210',
          addressLine1: '22 MG Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560001'
        }
      });
    console.log('Status:', outOfStockRes.status, '| Message:', outOfStockRes.body.message);
    if (outOfStockRes.status !== 400 || !outOfStockRes.body.message.includes('Insufficient stock')) {
      throw new Error('Expected 400 with Insufficient stock message');
    }

    // TEST 5 — Fake totalAmount sent from frontend & Create Payment Order
    console.log('\n[Test 5] Fake totalAmount sent from frontend (Server must calculate correct total)');
    userA.cart = [{ product: testProduct._id, quantity: 2 }]; // 2 * 2999 = 5998 INR = 599800 paise
    await userA.save();

    const createOrderRes = await request(app)
      .post('/orders/create-payment-order')
      .set('Cookie', [`token=${tokenA}`])
      .send({
        totalAmount: 1, // Fake total! Must be ignored!
        shippingAddress: {
          fullName: 'Aarav Sharma',
          phone: '9876543210',
          addressLine1: '22 MG Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560001'
        }
      });

    console.log('Status:', createOrderRes.status);
    console.log('ShopKart Order ID:', createOrderRes.body.shopKartOrderId);
    console.log('Razorpay Order ID:', createOrderRes.body.razorpayOrderId);
    console.log('Amount in paise:', createOrderRes.body.amount, '(₹' + (createOrderRes.body.amount / 100) + ')');

    if (createOrderRes.status !== 201) throw new Error('Expected 201 for order creation');
    if (createOrderRes.body.amount !== 599800) {
      throw new Error(`Expected server calculated amount 599800 paise, got ${createOrderRes.body.amount}`);
    }

    const createdShopKartOrderId = createOrderRes.body.shopKartOrderId;
    const createdRazorpayOrderId = createOrderRes.body.razorpayOrderId;

    // Verify snapshot in DB
    const savedOrder = await Order.findById(createdShopKartOrderId);
    if (!savedOrder) throw new Error('Order not found in database');
    if (savedOrder.items[0].price !== 2999 || savedOrder.items[0].name !== testProduct.name) {
      throw new Error('Order item snapshot does not match purchase-time product details');
    }
    if (savedOrder.paymentStatus !== 'PENDING' || savedOrder.status !== 'PENDING_PAYMENT') {
      throw new Error('Expected initial order status to be PENDING / PENDING_PAYMENT');
    }

    // TEST 6 — Cart must remain populated before payment verification!
    console.log('\n[Test 6] Verify cart is NOT cleared before payment verification');
    const userCartBefore = await Customer.findById(userA._id);
    console.log('Cart Items Count:', userCartBefore.cart.length);
    if (userCartBefore.cart.length === 0) {
      throw new Error('Cart was prematurely cleared before payment verification!');
    }

    // TEST 7 — Fake / Invalid payment verification
    console.log('\n[Test 7] Verify payment with invalid signature (Expected: 400, Cart kept)');
    const fakeVerifyRes = await request(app)
      .post('/orders/verify-payment')
      .set('Cookie', [`token=${tokenA}`])
      .send({
        shopKartOrderId: createdShopKartOrderId,
        razorpay_order_id: createdRazorpayOrderId,
        razorpay_payment_id: 'pay_fake_12345',
        razorpay_signature: 'invalid_fake_signature_abc'
      });

    console.log('Status:', fakeVerifyRes.status, '| Message:', fakeVerifyRes.body.message);
    if (fakeVerifyRes.status !== 400) throw new Error('Expected 400 for invalid payment signature');

    const userCartAfterFake = await Customer.findById(userA._id);
    if (userCartAfterFake.cart.length === 0) {
      throw new Error('Cart was incorrectly cleared on payment failure!');
    }

    // TEST 8 — Valid signature payment verification
    console.log('\n[Test 8] Verify payment with valid HMAC SHA256 signature');
    const secret = process.env.RAZORPAY_KEY_SECRET || 'shopkart_secret_test_key_2026';
    const validPaymentId = `pay_test_${Date.now()}`;
    const validSignature = crypto
      .createHmac('sha256', secret)
      .update(`${createdRazorpayOrderId}|${validPaymentId}`)
      .digest('hex');

    const validVerifyRes = await request(app)
      .post('/orders/verify-payment')
      .set('Cookie', [`token=${tokenA}`])
      .send({
        shopKartOrderId: createdShopKartOrderId,
        razorpay_order_id: createdRazorpayOrderId,
        razorpay_payment_id: validPaymentId,
        razorpay_signature: validSignature
      });

    console.log('Status:', validVerifyRes.status, '| Status:', validVerifyRes.body.order?.status, '| PaymentStatus:', validVerifyRes.body.order?.paymentStatus);
    if (validVerifyRes.status !== 200) throw new Error('Failed to verify payment with valid signature');
    if (validVerifyRes.body.order?.status !== 'PLACED' || validVerifyRes.body.order?.paymentStatus !== 'PAID') {
      throw new Error('Order not marked PAID / PLACED');
    }

    // TEST 9 — Cart must now be cleared!
    console.log('\n[Test 9] Confirm cart cleared after successful verification');
    const userCartAfterSuccess = await Customer.findById(userA._id);
    console.log('Cart Items Count:', userCartAfterSuccess.cart.length);
    if (userCartAfterSuccess.cart.length !== 0) {
      throw new Error('Cart was not cleared after successful payment verification!');
    }

    // Verify stock decremented
    const updatedProduct = await Product.findById(testProduct._id);
    console.log('Product stock after purchase:', updatedProduct.stock, '(decremented from 5 to 3)');
    if (updatedProduct.stock !== 3) {
      throw new Error(`Expected product stock to be 3, found ${updatedProduct.stock}`);
    }

    // TEST 10 — GET /orders (My Orders)
    console.log('\n[Test 10] GET /orders returns user orders');
    const getOrdersRes = await request(app)
      .get('/orders')
      .set('Cookie', [`token=${tokenA}`]);

    console.log('Status:', getOrdersRes.status, '| Orders count:', getOrdersRes.body.orders?.length);
    if (getOrdersRes.status !== 200 || getOrdersRes.body.orders.length === 0) {
      throw new Error('Failed to fetch user orders');
    }

    // TEST 11 — GET /orders/:id (Single order ownership check)
    console.log('\n[Test 11] GET /orders/:id ownership check');
    // Owner accesses order -> 200
    const ownerRes = await request(app)
      .get(`/orders/${createdShopKartOrderId}`)
      .set('Cookie', [`token=${tokenA}`]);
    console.log('Owner Access Status:', ownerRes.status);
    if (ownerRes.status !== 200) throw new Error('Owner failed to access their order');

    // Another user (userB) accesses userA order -> 403 Forbidden
    const otherUserRes = await request(app)
      .get(`/orders/${createdShopKartOrderId}`)
      .set('Cookie', [`token=${tokenB}`]);
    console.log('Other User Access Status:', otherUserRes.status, '| Message:', otherUserRes.body.message);
    if (otherUserRes.status !== 403) throw new Error('Expected 403 for unauthorized order access');

    // TEST 12 — Bonus: Update Order Status Progression
    console.log('\n[Test 12] Bonus: Update order status progression (PLACED -> CONFIRMED -> SHIPPED -> DELIVERED)');
    const updateRes = await request(app)
      .patch(`/orders/${createdShopKartOrderId}/status`)
      .set('Cookie', [`token=${tokenA}`])
      .send({ status: 'CONFIRMED' });
    console.log('Status:', updateRes.status, '| New Order Status:', updateRes.body.order?.status);
    if (updateRes.status !== 200 || updateRes.body.order?.status !== 'CONFIRMED') {
      throw new Error('Failed to update order status');
    }

    console.log('\n========================================================');
    console.log('🎉 ALL 12 BACKEND ORDER & PAYMENT TESTS PASSED PERFECTLY!');
    console.log('========================================================\n');
  } finally {
    // Cleanup
    if (userA) await Customer.findByIdAndDelete(userA._id);
    if (userB) await Customer.findByIdAndDelete(userB._id);
    if (testProduct) await Product.findByIdAndDelete(testProduct._id);
    await Order.deleteMany({ user: { $in: [userA?._id, userB?._id] } });
    await mongoose.connection.close();
  }
}

runOrderTests().catch((err) => {
  console.error('\n❌ Test execution failed:', err);
  process.exit(1);
});
