const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
      if (!allowedRoles.includes(req.user.role_id)) {
        return res.status(403).json({
          error: "Access denied. You do not have permission."
        });
      }
      next();
    };
  };
  
  module.exports = authorizeRoles;