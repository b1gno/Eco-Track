const calcolaModel = require('../models/calcolaModel');
const authModel = require('../models/authModel');

exports.getCalcola = async (req, res) => {
  const userId = req.session.userId;
  try {
    const tuttiStorico = await authModel.getRisultatiByUserId(userId);
    const storico = tuttiStorico.slice(0, 5);

    const risultatoOggi = await authModel.getRisultatoOggi(userId);
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
  } catch (err) {
    console.error('getCalcola error:', err);
    res.status(500).send('Errore interno');
  }
};

exports.postCalcola = async (req, res) => {
  const form = req.body;
  const userId = req.session.userId;
  try {
    const risultato = calcolaModel.calculateImpact(form);

    await authModel.createRisultato({
      userId,
      userName: req.session.userName,
      form,
      risultato
    });

    const tuttiStorico = await authModel.getRisultatiByUserId(userId);
    const storico = tuttiStorico.slice(0, 5);

    res.render('calcola', {
      risultato,
      form,
      userName: req.session.userName,
      storico,
      giaCompilato: true
    });
  } catch (err) {
    console.error('postCalcola error:', err);
    res.status(500).send('Errore interno');
  }
};