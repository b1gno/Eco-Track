const fs = require('fs');
const path = require('path');

const COEFFICIENTI_PATH = path.join(__dirname, '../data/coefficienti.json');
const RISULTATI_PATH = path.join(__dirname, '../data/risultati.json');

const coefficienti = JSON.parse(fs.readFileSync(COEFFICIENTI_PATH, 'utf8'));

// --- Helpers ---
const readRisultati = () => {
  try {
    return JSON.parse(fs.readFileSync(RISULTATI_PATH, 'utf8'));
  } catch {
    return [];
  }
};

const writeRisultati = (data) => {
  fs.writeFileSync(RISULTATI_PATH, JSON.stringify(data, null, 2), 'utf8');
};

/**
 * Calcola il totale CO2 dalle risposte del form.
 * Ogni domanda ha una chiave e un valore (già presente nei coefficienti).
 *
 * Form fields:
 *  - trasporto_tipo    (tipo veicolo)
 *  - trasporto_km      (km percorsi)
 *  - pasto             (tipo pasto)
 *  - shopping          (acquisto del giorno)
 *  - energia           (tipo energia domestica)
 *  - riscaldamento     (uso riscaldamento/condizionatore)
 *  - frequenza_carne   (quante volte mangi carne a settimana)
 */
const calculateImpact = (form) => {
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

  const co2Trasporto = km * (coefficienti.transport[trasporto_tipo] || 0);
  const co2Pasto     = coefficienti.food[pasto] || 0;
  const co2Shopping  = coefficienti.shopping[shopping] || 0;
  const co2Energia   = coefficienti.energia[energia] || 0;
  const co2Riscald   = coefficienti.riscaldamento[riscaldamento] || 0;
  const co2CarneSett = coefficienti.dieta_settimanale[frequenza_carne] || 0;

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

// --- Helpers ---
const today = () => new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

const getRisultatiUtente = (userId) => {
  const tutti = readRisultati();
  return tutti
    .filter(r => r.userId === userId)
    .sort((a, b) => new Date(b.data) - new Date(a.data));
};

const getRisultatoOggi = (userId) => {
  return getRisultatiUtente(userId).find(r => r.data.slice(0, 10) === today()) || null;
};

// --- Route Handlers ---
exports.getCalcola = (req, res) => {
  const userId = req.session.userId;
  const storico = getRisultatiUtente(userId).slice(0, 5);

  // Se l'utente ha già compilato il quiz oggi, mostra direttamente il risultato
  const risultatoOggi = getRisultatoOggi(userId);
  if (risultatoOggi && !req.query.rifai) {
    return res.render('calcola', {
      risultato: risultatoOggi.risultato,
      form: risultatoOggi.form,
      userName: req.session.userName,
      storico,
      giaCompilato: true
    });
  }

  res.render('calcola', {
    risultato: null,
    form: {},
    userName: req.session.userName,
    storico,
    giaCompilato: false
  });
};

exports.postCalcola = (req, res) => {
  const form = req.body;
  const risultato = calculateImpact(form);
  const userId = req.session.userId;

  // Salva il risultato nel JSON
  const tutti = readRisultati();
  const record = {
    id: require('crypto').randomUUID(),
    userId,
    userName: req.session.userName,
    data: new Date().toISOString(),
    form,
    risultato
  };
  tutti.push(record);
  writeRisultati(tutti);

  const storico = getRisultatiUtente(userId).slice(0, 5);

  res.render('calcola', {
    risultato,
    form,
    userName: req.session.userName,
    storico,
    giaCompilato: true
  });
};