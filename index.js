/* 
TV1 - Thành phần đã hoàn thành trong Tien-Dung-Absolvement-Authorized:
- Authentication (authRoutes)
- Users (userRoutes)
- Wishlist (wishlistRoutes)
- Notifications (notificationRoutes)
- Clubs (clubRoutes)
- Memberships (membershipRoutes)
- Kèm rate-limiting và centralized error handler, cấu hình PORT từ .env
*/

const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const rateLimit = require('express-rate-limit');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// Rate limit: 100 requests per 15 minutes per IP
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

app.get('/', (req, res) => {
  res.send('Club Management Backend is running');
});

// TV1 routes
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/users', require('./routes/userRoutes'));
app.use('/api/v1/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/v1/notifications', require('./routes/notificationRoutes'));
app.use('/api/v1/clubs', require('./routes/clubRoutes'));
app.use('/api/v1/memberships', require('./routes/membershipRoutes'));

// Centralized error handler (basic)
app.use((err, _req, res, _next) => {
  const status = err.statusCode || 500;
  res.status(status).json({ message: err.message || 'Internal Server Error' });
});

// Start server on fixed port from .env (default 3000)
const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} -> http://localhost:${PORT}`);
});
