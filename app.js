const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.use(session({
  secret: 'ecotrack-secret-2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Auth router (gestisce /login, /register, /logout )
const authRouter = require('./routes/auth');
app.use('/', authRouter);

// Pagine principali
app.use('/', require('./routes/pages'));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server attivo su http://localhost:${PORT}`);
});