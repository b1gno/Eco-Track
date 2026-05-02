const impactModel = require('../models/impactModel');
const fs = require('fs');
const path = require('path');
 
// Leggi i dati una volta all'avvio
const consigli = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/consigli.json'), 'utf8')
);
const emissioni = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/emissioni.json'), 'utf8')
);
const impatti = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/impatti.json'), 'utf8')
);
 
exports.getHome = (req, res) => {
  res.render('index', { consigli, emissioni, impatti });
};
 
exports.getCalcola = (req, res) => {
  res.render('calcola', { risultato: null, km: null, pasto: null });
};
 
exports.postCalcola = (req, res) => {
  const { km, pasto } = req.body;
  const calcolo = impactModel.calculateImpact(parseFloat(km), pasto);
  res.render('calcola', { risultato: calcolo, km, pasto });
};
 