const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const USERS_PATH = path.join(__dirname, '../data/users.json');

// --- Helpers ---
const readUsers = () => {
  try {
    return JSON.parse(fs.readFileSync(USERS_PATH, 'utf8'));
  } catch {
    return [];
  }
};

const writeUsers = (users) => {
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2), 'utf8');
};

const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password + 'ecotrack_salt_2026').digest('hex');
};

// --- Controllers ---
exports.getLogin = (req, res) => {
  if (req.session && req.session.userId) return res.redirect('/calcola');
  res.render('auth', { mode: 'login', error: null, success: null });
};

exports.getRegister = (req, res) => {
  if (req.session && req.session.userId) return res.redirect('/calcola');
  res.render('auth', { mode: 'register', error: null, success: null });
};

exports.postLogin = (req, res) => {
  const { email, password } = req.body;
  const users = readUsers();
  const user = users.find(u => u.email === email.toLowerCase().trim());

  if (!user || user.passwordHash !== hashPassword(password)) {
    return res.render('auth', {
      mode: 'login',
      error: 'Email o password errati. Riprova.',
      success: null
    });
  }

  req.session.userId = user.id;
  req.session.userName = user.nome;
  res.redirect('/calcola');
};

exports.postRegister = (req, res) => {
  const { nome, email, password, conferma } = req.body;
  const users = readUsers();

  if (!nome || !email || !password) {
    return res.render('auth', { mode: 'register', error: 'Compila tutti i campi.', success: null });
  }
  if (password !== conferma) {
    return res.render('auth', { mode: 'register', error: 'Le password non coincidono.', success: null });
  }
  if (password.length < 6) {
    return res.render('auth', { mode: 'register', error: 'La password deve essere di almeno 6 caratteri.', success: null });
  }
  if (users.find(u => u.email === email.toLowerCase().trim())) {
    return res.render('auth', { mode: 'register', error: 'Email già registrata. Prova ad accedere.', success: null });
  }

  const newUser = {
    id: uuidv4(),
    nome: nome.trim(),
    email: email.toLowerCase().trim(),
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  writeUsers(users);

  res.render('auth', {
    mode: 'login',
    error: null,
    success: 'Registrazione completata! Accedi ora.'
  });
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};