const Razorpay = require('razorpay');
const dotenv = require('dotenv');

dotenv.config();

const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder';
const key_secret = process.env.RAZORPAY_KEY_SECRET || 'shopkart_secret_test_key_2026';

let razorpay;
try {
  razorpay = new Razorpay({
    key_id: key_id,
    key_secret: key_secret
  });
} catch (err) {
  console.warn('Warning: Failed to initialize Razorpay SDK directly:', err.message);
  razorpay = {
    orders: {
      create: async (opts) => ({
        id: `order_${Date.now()}`,
        amount: opts.amount,
        currency: opts.currency,
        receipt: opts.receipt
      })
    }
  };
}

module.exports = razorpay;
