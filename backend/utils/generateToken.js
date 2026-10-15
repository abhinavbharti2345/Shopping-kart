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

  // Store JWT inside an HttpOnly cookie
  res.cookie('token', token, {
    httpOnly: true, // Prevents client-side JavaScript from accessing the cookie (XSS protection)
    sameSite: 'strict', // CSRF protection
    maxAge: 24 * 60 * 60 * 1000 // 1 day in milliseconds
  });

  return token;
};

module.exports = generateTokenAndSetCookie;
