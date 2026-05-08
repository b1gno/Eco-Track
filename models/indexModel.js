const fs = require('fs');
const path = require('path');

let consigli = null;
let impatti = null;

exports.getConsigli = () => {
  if (!consigli) {
    consigli = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../data/consigli.json'), 'utf8')
    );
  }
  return consigli;
};

exports.getImpatti = () => {
  if (!impatti) {
    impatti = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../data/impatti.json'), 'utf8')
    );
  }
  return impatti;
};
