const User = require('../models/User');

exports.getMe = async (req, res) => {
  res.json({ user: req.user });
};

exports.updateMe = async (req, res) => {
  try {
    const allowed = ['name', 'email'];
    const data = {};
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) data[k] = req.body[k];
    });
    const user = await User.findByIdAndUpdate(req.user._id, data, {
      new: true,
      runValidators: true
    });
    res.json({ user });
  } catch (e) {
    res.status(400).json({ message: 'Update profile failed', error: e.message });
  }
};

// Admin
exports.getUsers = async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json(users);
};

exports.getUserById = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};

exports.updateUserById = async (req, res) => {
  try {
    const allowed = ['name', 'email', 'role'];
    const data = {};
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) data[k] = req.body[k];
    });
    const user = await User.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (e) {
    res.status(400).json({ message: 'Update user failed', error: e.message });
  }
};

exports.deleteUserById = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ message: 'User deleted' });
};
