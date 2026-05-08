const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const USERS_PATH = path.join(__dirname, '../data/users.json');
const RISULTATI_PATH = path.join(__dirname, '../data/risultati.json');
const SALT = 'ecotrack_salt_2026';

// --- Utenti ---

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

exports.hashPassword = (password) => {
  return crypto.createHash('sha256').update(password + SALT).digest('hex');
};

exports.findByEmail = (email) => {
  const users = readUsers();
  return users.find(u => u.email === email.toLowerCase().trim()) || null;
};

exports.findById = (id) => {
  const users = readUsers();
  return users.find(u => u.id === id) || null;
};

exports.emailExists = (email) => {
  return exports.findByEmail(email) !== null;
};

exports.createUser = (userData) => {
  const users = readUsers();
  const newUser = {
    id: userData.id,
    nome: userData.nome.trim(),
    email: userData.email.toLowerCase().trim(),
    passwordHash: userData.passwordHash,
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  writeUsers(users);
  return newUser;
};

// --- Risultati ---

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

exports.getRisultatiByUserId = (userId) => {
  const tutti = readRisultati();
  return tutti
    .filter(r => r.userId === userId)
    .sort((a, b) => new Date(b.data) - new Date(a.data));
};

exports.getRisultatoOggi = (userId) => {
  const today = new Date().toISOString().slice(0, 10);
  const risultati = exports.getRisultatiByUserId(userId);
  return risultati.find(r => r.data.slice(0, 10) === today) || null;
};

exports.createRisultato = (record) => {
  const tutti = readRisultati();
  const newRecord = {
    id: crypto.randomUUID(),
    userId: record.userId,
    userName: record.userName,
    data: new Date().toISOString(),
    form: record.form,
    risultato: record.risultato
  };
  tutti.push(newRecord);
  writeRisultati(tutti);
  return newRecord;
};
