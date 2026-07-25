const AppError = require('../utils/AppError');

const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(
        `Access denied. Required role: ${allowedRoles.join(' or ')}`,
        403
      );
    }

    next();
  };
};

module.exports = { checkRole };