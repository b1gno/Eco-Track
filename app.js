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

// Rotte principali
app.use('/', require('./routes/pages'));
// app.use('/api', require('./routes/api'));
// app.use('/auth', require('./routes/auth'));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server attivo su http://localhost:${PORT}`);
});