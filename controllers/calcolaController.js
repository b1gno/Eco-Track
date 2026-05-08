const calcolaModel = require('../models/calcolaModel');
const authModel = require('../models/authModel');

exports.getCalcola = (req, res) => {
  const userId = req.session.userId;
  const storico = authModel.getRisultatiByUserId(userId).slice(0, 5);

  const risultatoOggi = authModel.getRisultatoOggi(userId);
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
  const userId = req.session.userId;
  const risultato = calcolaModel.calculateImpact(form);

  authModel.createRisultato({
    userId,
    userName: req.session.userName,
    form,
    risultato
  });

  const storico = authModel.getRisultatiByUserId(userId).slice(0, 5);

  res.render('calcola', {
    risultato,
    form,
    userName: req.session.userName,
    storico,
    giaCompilato: true
  });
};
