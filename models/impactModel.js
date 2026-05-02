const fs = require('fs');
const path = require('path');

// Leggi i coefficienti una volta all'avvio
const coefficienti = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/coefficienti.json'), 'utf8')
);

exports.calculateImpact = (km, pasto) => {
  const co2Km = km * coefficienti.transport.auto_km;
  const co2Pasto = coefficienti.food[pasto] || 0;
  
  return {
    totale: (co2Km + co2Pasto).toFixed(2),
    dettaglio: { km: co2Km.toFixed(2), pasto: co2Pasto.toFixed(2) }
  };
};

// Export anche i dati per il controller (da usare nelle select)
exports.getFoodOptions = () => {
  return JSON.parse(
    fs.readFileSync(path.join(__dirname, '../data/foods.json'), 'utf8')
  );
};