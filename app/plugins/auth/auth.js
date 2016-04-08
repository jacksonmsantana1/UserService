const curry = require('ramda').curry;
const Boom = require('boom');

const validate = (request, decodedToken, callback) => {
  const error = Boom.badRequest('Invalid Token - ID value doesnt exist');
  const credentials = decodedToken || {};

  if (!credentials.id) {
    return callback(error, false, credentials);
  }

  return callback(null, true, credentials);
};

/*eslint no-unused-vars:1*/
const Auth = curry((server, error) => {
  server.auth.strategy('token', 'jwt', {
    key: require('../../../privateKey.js'),
    validateFunc: validate,
    verifyOptions: {
      algorithms: ['HS256'],
    },
  });
});

module.exports = Auth;
