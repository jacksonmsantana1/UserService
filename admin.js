const jwt = require('jsonwebtoken');
const KEY = require('./privateKey');

const options = {
  algorithm: 'HS256',
  expiresIn: 7200000,
};

module.exports = 'Bearer ' + jwt.sign({ id: 'adminUser' }, KEY, options);
