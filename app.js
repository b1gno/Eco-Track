const express = require('express');
const app = express();
const path = require('path');

// Configurazione per leggere dati dai form e JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Cartella per file statici (CSS, Immagini)
app.use(express.static('public'));

// Motore di template
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Sostituisci la vecchia rotta app.get('/', ...) con:
const indexRouter = require('./routes/index');
app.use('/', indexRouter);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server attivo su http://localhost:${PORT}`);
});