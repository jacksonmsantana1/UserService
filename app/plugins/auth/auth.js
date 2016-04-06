let R = require('ramda');
let Boom = require('boom');
let privateKey = 'dsakf34CONOUNAclOCUICObl3292weas34gbsLJ32f';

let validate = (request, decodedToken, callback) => {
  let error = Boom.badRequest('Invalid Token - ID value doesnt exist');;
  let credentials = decodedToken || {};
  if (!credentials.id) {
    return callback(error, false, credentials);
  }

  return callback(null, true, credentials);
};

let Auth = R.curry((server, error) => {
  server.auth.strategy('token', 'jwt', {
    key: privateKey,
    validateFunc: validate,
    verifyOptions: {
      algorithms: ['HS256'],
    },
  });
});

module.exports = Auth;
