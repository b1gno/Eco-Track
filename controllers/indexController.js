const impactModel = require('../models/impactModel');
 
exports.getHome = (req, res) => {
    res.render('index');
};
 
exports.getCalcola = (req, res) => {
    res.render('calcola', { risultato: null, km: null, pasto: null });
};
 
exports.postCalcola = (req, res) => {
    const { km, pasto } = req.body;
    const calcolo = impactModel.calculateImpact(parseFloat(km), pasto);
    res.render('calcola', { risultato: calcolo, km, pasto });
};