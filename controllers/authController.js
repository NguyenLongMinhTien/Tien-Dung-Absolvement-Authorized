const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'name, email, and password are required' });
    if (typeof password !== 'string' || password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already in use' });
    const user = await User.create({ name, email, password, role: role || 'student' });

    // Fire-and-forget welcome notification
    createNotification({
      user: user._id,
      title: 'Welcome! 🎉',
      message: 'Your account has been created successfully.'
    }).catch(() => {});

    const token = signToken(user);
    res.status(201).json({ token, user });
  } catch (e) {
    res.status(500).json({ message: 'Register failed', error: e.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'email and password are required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const ok = await user.matchPassword(password);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
    const token = signToken(user);
    res.json({ token, user: user.toJSON() });
  } catch (e) {
    res.status(500).json({ message: 'Login failed', error: e.message });
  }
};
