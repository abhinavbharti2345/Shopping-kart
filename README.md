# Shopping-kart 🛒

A full-stack MERN (MongoDB, Express, React, Node.js) e-commerce application featuring product cataloging, user authentication, cart & wishlist management, and Razorpay payment gateway integration.

## 📁 Project Structure

```text
Shopping-kart/
├── backend/               # Node.js & Express API server
│   ├── config/            # Database and service configurations
│   ├── controllers/       # Route controllers (Auth, Products, Cart, Orders, Wishlist)
│   ├── middlewares/       # Auth & error handling middlewares
│   ├── models/            # Mongoose schemas (User, Product, Cart, Order, Wishlist)
│   ├── routes/            # Express API endpoints
│   ├── utils/             # Helper utilities
│   └── .env.example       # Example environment variables
├── frontend/              # React + Vite client application
│   ├── src/               # React components, pages, context, and assets
│   └── package.json       # Frontend dependencies and scripts
├── .gitignore             # Root gitignore excluding secrets, diagrams, and builds
└── package.json           # Root package configuration
```

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/) (Atlas or local instance)
- [Razorpay](https://razorpay.com/) Account (for test payments)

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Fill in your MongoDB connection string, JWT secret, and Razorpay API credentials.
4. Start the backend server:
   ```bash
   npm run dev
   # or node index.js
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

## 🔒 Security Note
- Secrets and `.env` files are excluded from version control. Never commit live API keys or database credentials.