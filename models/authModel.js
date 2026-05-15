const crypto = require('crypto');
const { getDb } = require('./db');

const SALT = 'ecotrack_salt_2026';

// ── Helpers ──────────────────────────────────────────────

exports.hashPassword = (password) =>
  crypto.createHash('sha256').update(password + SALT).digest('hex');

const usersCol  = () => getDb().collection('Users');
const risultatiCol = () => getDb().collection('Results');

// ── Utenti ───────────────────────────────────────────────

exports.findByEmail = async (email) => {
  return usersCol().findOne({ email: email.toLowerCase().trim() });
};

exports.findById = async (id) => {
  return usersCol().findOne({ id });
};

exports.emailExists = async (email) => {
  const user = await exports.findByEmail(email);
  return user !== null;
};

exports.createUser = async (userData) => {
  const newUser = {
    id: userData.id,
    nome: userData.nome.trim(),
    email: userData.email.toLowerCase().trim(),
    passwordHash: userData.passwordHash,
    createdAt: new Date().toISOString()
  };
  await usersCol().insertOne(newUser);
  return newUser;
};

// ── Risultati ────────────────────────────────────────────

exports.getRisultatiByUserId = async (userId) => {
  return risultatiCol()
    .find({ userId })
    .sort({ data: -1 })
    .toArray();
};

exports.getRisultatoOggi = async (userId) => {
  const today = new Date().toISOString().slice(0, 10);
  const risultati = await exports.getRisultatiByUserId(userId);
  return risultati.find(r => r.data.slice(0, 10) === today) || null;
};

exports.createRisultato = async (record) => {
  const newRecord = {
    id: crypto.randomUUID(),
    userId: record.userId,
    userName: record.userName,
    data: new Date().toISOString(),
    form: record.form,
    risultato: record.risultato
  };
  await risultatiCol().insertOne(newRecord);
  return newRecord;
};