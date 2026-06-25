const User = require('../models/userModel');

module.exports = async function (req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (user && user.isAdmin) {
      next();
    } else {
      return res.status(403).json({ msg: 'Access denied. Admin privileges required.' });
    }
  } catch (err) {
    console.error('Admin middleware error:', err.message);
    res.status(500).send('Server Error');
  }
};