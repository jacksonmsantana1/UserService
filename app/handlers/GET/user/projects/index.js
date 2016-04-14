const curry = require('ramda').curry;
const get = require('ramda').prop;
const Boom = require('boom');
const jwt = require('jsonwebtoken');
const key = require('../../../../../privateKey.js');

// isAutheticated :: (Request, String:credential) -> Promise(ID, Error)
const isAuthenticated = (request, credential) => {
  if (!!request && !!request.auth && !!request.params) {
    return request.auth.isAuthenticated ? Promise.resolve(credential) :
      Promise.reject(request.auth.error);
  }

  return Promise.error(Boom.badImplementation('Invalid Request Object'));
};

// getUser :: Collection:db -> Collection -> String:uid -> Promise(User, Error)
const getUser = require('../../../../User/User.js').getUser;

// signNewToken :: String:uid -> Token
const signNewToken = (uid) => jwt.sign({ id: uid }, key, { algorithm: 'HS256' });

// setAuthorizationHeader :: Function:reply -> String:credential -> Promise([Project])
const setAuthorizationHeader = curry((reply, credential, projects) => {
  reply(projects).header('authorization', signNewToken(credential));
  return Promise.resolve(projects);
});

// sendProjects :: Function:reply -> [Project] -> Response([Project], Error)
const sendProjects = curry((reply, projects) => {
  if (!!projects) {
    reply(projects);
  }

  reply(Boom.badImplementation('Invalid User Projects'));
});

// sendError :: Function:reply -> Error -> Response(Error)
const sendError = curry((reply, error) => {
  reply(error);
});

module.exports = (request, reply) => {
  const credential = request.auth.credentials.id;
  const db = request.server.plugins['hapi-mongodb'].db;
  const collection = db.collection('users');

  isAuthenticated(request, credential)
    .then(getUser(collection))
    .then(get('projects'))
    .then(setAuthorizationHeader(reply, credential))
    .then(sendProjects(reply))
    .catch(sendError(reply));
};
