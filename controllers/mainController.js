const carbonModel = require('../models/carbonModel');

exports.getHome = (req, res) => {
    res.render('index', { risultato: null });
};

exports.postCalcola = (req, res) => {
    const { km, pasto } = req.body;
    
    // Chiamiamo il Model per i calcoli
    const calcolo = carbonModel.calculateImpact(parseFloat(km), pasto);
    
    // Restituiamo la vista con i dati calcolati
    res.render('index', { risultato: calcolo });
};