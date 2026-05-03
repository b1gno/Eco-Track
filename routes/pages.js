const express = require('express');
const router = express.Router();
const mainController = require('../controllers/indexController');

router.get('/', mainController.getHome);
router.get('/calcola', mainController.getCalcola);
router.post('/calcola', mainController.postCalcola);
router.get('/aria', mainController.getAria);

module.exports = router;