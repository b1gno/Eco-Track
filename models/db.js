const { MongoClient } = require('mongodb');

const URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = 'Utenti';

let client = null;
let db = null;

const connect = async () => {
  if (db) return db;
  client = new MongoClient(URI);
  await client.connect();
  db = client.db(DB_NAME);
  console.log(`MongoDB connesso — database: ${DB_NAME}`);
  return db;
};

const getDb = () => {
  if (!db) throw new Error('MongoDB non ancora connesso. Chiama connect() prima.');
  return db;
};

module.exports = { connect, getDb };