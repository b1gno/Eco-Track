const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// ── Middleware: inietta utente in res.locals (usato da tutte le view) ──
router.use((req, res, next) => {
  res.locals.isLoggedIn = !!(req.session && req.session.userId);
  res.locals.userName = req.session ? req.session.userName : null;
  next();
});

// ── Route auth ──
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.get('/register', authController.getRegister);
router.post('/register', authController.postRegister);
router.get('/logout', authController.logout);

module.exports = router;