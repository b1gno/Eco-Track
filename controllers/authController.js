let uuidv4;
import('uuid').then(mod => { uuidv4 = mod.v4; });

const authModel = require('../models/authModel');

exports.getLogin = (req, res) => {
  if (req.session && req.session.userId) return res.redirect('/calcola');
  res.render('auth', { mode: 'login', error: null, success: null });
};

exports.getRegister = (req, res) => {
  if (req.session && req.session.userId) return res.redirect('/calcola');
  res.render('auth', { mode: 'register', error: null, success: null });
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await authModel.findByEmail(email);
    if (!user || user.passwordHash !== authModel.hashPassword(password)) {
      return res.render('auth', {
        mode: 'login',
        error: 'Email o password errati. Riprova.',
        success: null
      });
    }
    req.session.userId = user.id;
    req.session.userName = user.nome;
    res.redirect('/calcola');
  } catch (err) {
    console.error('Login error:', err);
    res.render('auth', { mode: 'login', error: 'Errore interno. Riprova.', success: null });
  }
};

exports.postRegister = async (req, res) => {
  const { nome, email, password, conferma } = req.body;

  if (!nome || !email || !password) {
    return res.render('auth', { mode: 'register', error: 'Compila tutti i campi.', success: null });
  }
  if (password !== conferma) {
    return res.render('auth', { mode: 'register', error: 'Le password non coincidono.', success: null });
  }
  if (password.length < 6) {
    return res.render('auth', { mode: 'register', error: 'La password deve essere di almeno 6 caratteri.', success: null });
  }

  try {
    if (await authModel.emailExists(email)) {
      return res.render('auth', { mode: 'register', error: 'Email già registrata. Prova ad accedere.', success: null });
    }
    await authModel.createUser({
      id: uuidv4(),
      nome: nome.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: authModel.hashPassword(password)
    });
    res.render('auth', { mode: 'login', error: null, success: 'Registrazione completata! Accedi ora.' });
  } catch (err) {
    console.error('Register error:', err);
    res.render('auth', { mode: 'register', error: 'Errore interno. Riprova.', success: null });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
};