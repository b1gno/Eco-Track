// Coefficienti di emissione (kg di CO2 per unità)
const COEFFICIENTS = {
    auto_km: 0.12,      // 120g per km
    pasto_vegano: 0.5,  // Emissioni medie per produzione/trasporto
    pasto_vegetariano: 1.2,
    pasto_carne: 3.5
};

exports.calculateImpact = (km, pasto) => {
    const co2Km = km * COEFFICIENTS.auto_km;
    const co2Pasto = COEFFICIENTS[`pasto_${pasto}`] || 0;
    
    return {
        totale: (co2Km + co2Pasto).toFixed(2),
        dettaglio: { km: co2Km.toFixed(2), pasto: co2Pasto.toFixed(2) }
    };
};