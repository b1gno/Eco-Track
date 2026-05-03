exports.requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  res.redirect('/login?redirect=' + encodeURIComponent(req.originalUrl));
};

exports.injectUser = (req, res, next) => {
  res.locals.isLoggedIn = !!(req.session && req.session.userId);
  res.locals.userName = req.session ? req.session.userName : null;
  next();
};