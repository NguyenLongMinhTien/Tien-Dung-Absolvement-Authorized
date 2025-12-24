const Membership = require('../models/Membership');

const isAdmin = (req) => req.user && req.user.role === 'admin';

// Guard: admin OR leader of club (clubId can come from params or body)
exports.adminOrLeaderByClubParam = (param = 'clubId') => {
  return async (req, res, next) => {
    try {
      const clubId = req.params[param] || req.body[param];
      if (!clubId) return res.status(400).json({ message: 'clubId is required' });
      if (isAdmin(req)) return next();

      const m = await Membership.findOne({ user: req.user._id, club: clubId, status: 'approved' });
      if (m && m.role === 'leader') return next();
      return res.status(403).json({ message: 'Not allowed' });
    } catch (e) {
      next(e);
    }
  };
};

// Guard: admin OR leader of the club of given membership :id
exports.adminOrLeaderByMembershipId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const membership = await Membership.findById(id);
    if (!membership) return res.status(404).json({ message: 'Membership not found' });
    if (isAdmin(req)) return next();

    const self = await Membership.findOne({ user: req.user._id, club: membership.club, status: 'approved' });
    if (self && self.role === 'leader') return next();
    return res.status(403).json({ message: 'Not allowed' });
  } catch (e) {
    next(e);
  }
};
