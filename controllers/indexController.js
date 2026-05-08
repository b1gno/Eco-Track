const indexModel = require('../models/indexModel');
const calcolaModel = require('../models/calcolaModel');

exports.getHome = (req, res) => {
  const consigli = indexModel.getConsigli();
  const impatti = indexModel.getImpatti();
  const emissioni = calcolaModel.getEmissioni();
  res.render('index', { consigli, emissioni, impatti });
};

exports.getAria = (req, res) => {
  res.render('aria');
};
