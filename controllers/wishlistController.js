const Wishlist = require('../models/Wishlist');

exports.getMyWishlist = async (req, res) => {
  let wl = await Wishlist.findOne({ user: req.user._id });
  if (!wl) wl = await Wishlist.create({ user: req.user._id, clubs: [] });
  res.json(wl);
};

exports.addToWishlist = async (req, res) => {
  try {
    const { clubId } = req.body;
    if (!clubId) return res.status(400).json({ message: 'clubId is required' });
    const wl = await Wishlist.findOneAndUpdate(
      { user: req.user._id },
      { $addToSet: { clubs: clubId } },
      { new: true, upsert: true }
    );
    res.json(wl);
  } catch (e) {
    res.status(400).json({ message: 'Add to wishlist failed', error: e.message });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const { clubId } = req.body;
    if (!clubId) return res.status(400).json({ message: 'clubId is required' });
    const wl = await Wishlist.findOneAndUpdate(
      { user: req.user._id },
      { $pull: { clubs: clubId } },
      { new: true }
    );
    res.json(wl || { user: req.user._id, clubs: [] });
  } catch (e) {
    res.status(400).json({ message: 'Remove from wishlist failed', error: e.message });
  }
};
