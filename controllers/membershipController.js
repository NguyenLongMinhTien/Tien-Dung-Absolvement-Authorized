const { validationResult } = require('express-validator');
const Membership = require('../models/Membership');
const Club = require('../models/Club');
const Notification = require('../models/Notification');

const buildPagination = (req) => {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const isAdmin = (req) => req.user && req.user.role === 'admin';

const isClubLeader = async (userId, clubId) => {
  const m = await Membership.findOne({ user: userId, club: clubId, status: 'approved' });
  return !!m && m.role === 'leader';
};

exports.apply = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { clubId } = req.body;
    const club = await Club.findById(clubId);
    if (!club) return res.status(404).json({ success: false, message: 'Club not found' });

    const membership = await Membership.create({ user: req.user._id, club: clubId, status: 'pending' });
    res.status(201).json({ success: true, data: membership });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'You already applied or joined this club' });
    }
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getMyMemberships = async (req, res) => {
  const { page, limit, skip } = buildPagination(req);
  const [items, total] = await Promise.all([
    Membership.find({ user: req.user._id }).populate('club', 'name description').skip(skip).limit(limit),
    Membership.countDocuments({ user: req.user._id })
  ]);
  res.json({ success: true, data: items, page, limit, total });
};

exports.getClubMembers = async (req, res) => {
  const { clubId } = req.params;
  const allowed = isAdmin(req) || (await isClubLeader(req.user._id, clubId));
  if (!allowed) return res.status(403).json({ success: false, message: 'Forbidden' });

  const { page, limit, skip } = buildPagination(req);
  const q = { club: clubId };
  if (req.query.q) q.$or = [
    { role: { $regex: req.query.q, $options: 'i' } },
    { status: { $regex: req.query.q, $options: 'i' } }
  ];
  const [items, total] = await Promise.all([
    Membership.find(q).populate('user', 'name email').skip(skip).limit(limit),
    Membership.countDocuments(q)
  ]);
  res.json({ success: true, data: items, page, limit, total });
};

exports.approve = async (req, res) => {
  const membership = await Membership.findById(req.params.id);
  if (!membership) return res.status(404).json({ success: false, message: 'Membership not found' });
  const allowed = isAdmin(req) || (await isClubLeader(req.user._id, membership.club));
  if (!allowed) return res.status(403).json({ success: false, message: 'Forbidden' });

  membership.status = 'approved';
  membership.joinedAt = new Date();
  await membership.save();

  try {
    await Notification.create({ user: membership.user, title: 'Membership Approved', message: 'Đơn đăng ký vào câu lạc bộ đã được duyệt.' });
  } catch (_) {}

  res.json({ success: true, data: membership });
};

exports.reject = async (req, res) => {
  const membership = await Membership.findById(req.params.id);
  if (!membership) return res.status(404).json({ success: false, message: 'Membership not found' });
  const allowed = isAdmin(req) || (await isClubLeader(req.user._id, membership.club));
  if (!allowed) return res.status(403).json({ success: false, message: 'Forbidden' });

  membership.status = 'rejected';
  await membership.save();

  try {
    await Notification.create({ user: membership.user, title: 'Membership Rejected', message: 'Đơn đăng ký vào câu lạc bộ đã bị từ chối.' });
  } catch (_) {}

  res.json({ success: true, data: membership });
};

exports.leave = async (req, res) => {
  const membership = await Membership.findById(req.params.id);
  if (!membership) return res.status(404).json({ success: false, message: 'Membership not found' });
  if (String(membership.user) !== String(req.user._id)) return res.status(403).json({ success: false, message: 'Not allowed' });

  await membership.deleteOne();
  res.json({ success: true, message: 'Left club successfully' });
};

exports.setRole = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const membership = await Membership.findById(req.params.id);
  if (!membership) return res.status(404).json({ success: false, message: 'Membership not found' });
  const allowed = isAdmin(req) || (await isClubLeader(req.user._id, membership.club));
  if (!allowed) return res.status(403).json({ success: false, message: 'Forbidden' });

  membership.role = req.body.role;
  await membership.save();
  res.json({ success: true, data: membership });
};
