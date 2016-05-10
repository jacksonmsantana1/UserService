const jwt = require('jsonwebtoken');
const KEY = require('./privateKey');
const admin = '123kjh98fu0apsj2-234';
const options = {
  algorithm: 'HS256',
  expiresIn: 7200000,
};

module.exports = 'Bearer ' + jwt.sign({ id: admin, admin: true }, KEY, options);
