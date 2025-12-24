const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    clubs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Club' }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Wishlist', wishlistSchema);
