const Notification = require('../models/Notification');

exports.getUnread = async (req, res) => {
  const list = await Notification.find({ user: req.user._id, read: false }).sort({ createdAt: -1 });
  res.json({ success: true, data: list });
};

exports.markRead = async (req, res) => {
  const updated = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { read: true },
    { new: true }
  );
  if (!updated) return res.status(404).json({ message: 'Notification not found' });
  res.json({ success: true, data: updated });
};

exports.markAllRead = async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
  res.json({ success: true, message: 'All notifications marked as read' });
};

// Helper to create a notification (can be used by other controllers)
exports.createNotification = async ({ user, title, message = '', type = 'info', link }) => {
  return Notification.create({ user, title, message, type, link });
};

// New: unread count
exports.getUnreadCount = async (req, res) => {
  const count = await Notification.countDocuments({ user: req.user._id, read: false });
  res.json({ success: true, data: { count } });
};
