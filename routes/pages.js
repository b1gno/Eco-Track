const express = require('express');
const router = express.Router();
const mainController = require('../controllers/indexController');
const calcolaController = require('../controllers/calcolaController');
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

router.get('/', mainController.getHome);

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.get('/register', authController.getRegister);
router.post('/register', authController.postRegister);
router.get('/logout', authController.logout);

router.get('/calcola', requireAuth, calcolaController.getCalcola);
router.post('/calcola', requireAuth, calcolaController.postCalcola);  

router.get('/aria', mainController.getAria);

module.exports = router;