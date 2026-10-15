const jwt = require('jsonwebtoken');

/**
 * Generates a JSON Web Token (JWT) with the customer ID
 * and sets it inside an HttpOnly cookie on the response.
 */
const generateTokenAndSetCookie = (customerId, res) => {
  // Generate JWT containing customer ID
  const token = jwt.sign(
    { id: customerId },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  const isProduction = process.env.NODE_ENV === 'production';

  // Store JWT inside an HttpOnly cookie
  res.cookie('token', token, {
    httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
    secure: isProduction, // HTTPS required in production
    sameSite: isProduction ? 'none' : 'lax', // Required for cross-origin deployment (e.g. Vercel -> Render)
    maxAge: 24 * 60 * 60 * 1000 // 1 day in milliseconds
  });

  return token;
};

module.exports = generateTokenAndSetCookie;
