const fs = require('fs');
const path = require('path');

let coefficienti = null;
let emissioni = null;
let cibi = null;

// --- Coefficienti ---

const loadCoefficienti = () => {
  if (!coefficienti) {
    coefficienti = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../data/coefficienti.json'), 'utf8')
    );
  }
  return coefficienti;
};

exports.getCoefficienti = () => {
  return loadCoefficienti();
};

exports.getCoefficiente = (category, key) => {
  const data = loadCoefficienti();
  return (data[category] && data[category][key]) || 0;
};

// --- Emissioni ---

exports.getEmissioni = () => {
  if (!emissioni) {
    emissioni = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../data/emissioni.json'), 'utf8')
    );
  }
  return emissioni;
};

// --- Cibi ---

exports.getCibi = () => {
  if (!cibi) {
    cibi = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../data/foods.json'), 'utf8')
    );
  }
  return cibi;
};

// --- Calcolo impatto ---

exports.calculateImpact = (form) => {
  const {
    trasporto_tipo = 'bici_km',
    trasporto_km = 0,
    pasto = 'vegano',
    shopping = 'nessuno',
    energia = 'misto',
    riscaldamento = 'nessuno',
    frequenza_carne = 'mai'
  } = form;

  const km = parseFloat(trasporto_km) || 0;

  const co2Trasporto = km * exports.getCoefficiente('transport', trasporto_tipo);
  const co2Pasto     = exports.getCoefficiente('food', pasto);
  const co2Shopping  = exports.getCoefficiente('shopping', shopping);
  const co2Energia   = exports.getCoefficiente('energia', energia);
  const co2Riscald   = exports.getCoefficiente('riscaldamento', riscaldamento);
  const co2CarneSett = exports.getCoefficiente('dieta_settimanale', frequenza_carne);

  const totale = co2Trasporto + co2Pasto + co2Shopping + co2Energia + co2Riscald + co2CarneSett;

  return {
    totale: totale.toFixed(2),
    dettaglio: {
      trasporto:   co2Trasporto.toFixed(2),
      pasto:       co2Pasto.toFixed(2),
      shopping:    co2Shopping.toFixed(2),
      energia:     co2Energia.toFixed(2),
      riscaldamento: co2Riscald.toFixed(2),
      frequenza_carne: co2CarneSett.toFixed(2)
    }
  };
};
