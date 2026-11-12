
function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated === true) {
    return next();
  }

  return res.status(401).json({
    success: false,
    message: "Please log in to continue."
  });
}

module.exports = requireAuth;
