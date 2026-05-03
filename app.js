const express = require('express');
const session = require('express-session')
const app = express();
const path = require('path');
const { injectUser } = require('./middleware/auth')

// Configurazione per leggere dati dai form e JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Cartella per file statici (CSS, Immagini)
app.use(express.static('public'));

app.use(session({
  secret: 'ecotrack-secret-2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 ore
}));

app.use(injectUser);

// Motore di template
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Rotte principali
app.use('/', require('./routes/pages'));
// app.use('/api', require('./routes/api'));
// app.use('/auth', require('./routes/auth'));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server attivo su http://localhost:${PORT}`);
});