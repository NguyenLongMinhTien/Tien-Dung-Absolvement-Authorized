const { validationResult } = require('express-validator');
const Club = require('../models/Club');

// Helpers
const buildPagination = (req) => {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

exports.createClub = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const club = await Club.create({ name: req.body.name, description: req.body.description || '', createdBy: req.user._id });
    res.status(201).json({ success: true, data: club });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Club name already exists' });
    }
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getClubs = async (req, res) => {
  const { page, limit, skip } = buildPagination(req);
  const q = {};
  if (req.query.q) q.name = { $regex: req.query.q, $options: 'i' };
  const [items, total] = await Promise.all([
    Club.find(q).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Club.countDocuments(q)
  ]);
  res.json({ success: true, data: items, page, limit, total });
};

exports.getClubById = async (req, res) => {
  const club = await Club.findById(req.params.id);
  if (!club) return res.status(404).json({ success: false, message: 'Club not found' });
  res.json({ success: true, data: club });
};

exports.updateClub = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const club = await Club.findByIdAndUpdate(req.params.id, { name: req.body.name, description: req.body.description }, { new: true, runValidators: true });
  if (!club) return res.status(404).json({ success: false, message: 'Club not found' });
  res.json({ success: true, data: club });
};

exports.deleteClub = async (req, res) => {
  const club = await Club.findByIdAndDelete(req.params.id);
  if (!club) return res.status(404).json({ success: false, message: 'Club not found' });
  res.json({ success: true, message: 'Club deleted' });
};
