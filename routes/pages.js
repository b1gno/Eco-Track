const express = require('express');
const router = express.Router();
const mainController = require('../controllers/indexController');
const calcolaController = require('../controllers/calcolaController');

// requireAuth definito direttamente qui
const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) return next();
  res.redirect('/login?redirect=' + encodeURIComponent(req.originalUrl));
};

router.get('/', mainController.getHome);
router.get('/calcola', requireAuth, calcolaController.getCalcola);
router.post('/calcola', requireAuth, calcolaController.postCalcola);
router.get('/aria', mainController.getAria);

module.exports = router;