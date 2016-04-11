const curry = require('ramda').curry;
const get = require('ramda').prop;
const Boom = require('boom');
const jwt = require('jsonwebtoken');
const key = require('../../../../../privateKey.js');

// isAutheticated :: Request -> Promise(ID, Error)
const isAuthenticated = (request, credentials) => {
  if (!!request && !!request.auth && !!request.params) {
    return request.auth.isAuthenticated ? Promise.resolve(credentials) :
      Promise.reject(request.auth.error);
  }

  return Promise.error(Boom.badImplementation('Invalid Request Object'));
};

// getUser :: String -> Promise(User, Error)
const getUser = require('../../../../User/User.js').getUser;

// signNewToken :: User -> Token
const signNewToken = (uid) => jwt.sign({ id: uid }, key, { algorithm: 'HS256' });

// setAuthorizationHeader :: Function -> User -> Promise(Projects)
const setAuthorizationHeader = curry((reply, credentials, projects) => {
  reply(projects).header('authorization', signNewToken(credentials));
  return Promise.resolve(projects);
});

// sendProjects :: User -> Response(Projects, Error)
const sendProjects = curry((reply, projects) => {
  if (!!projects) {
    reply(projects);
  }

  reply(Boom.badImplementation('Invalid User Projects'));
});

// sendError :: Response -> Error -> Response(Error)
const sendError = curry((reply, error) => {
  reply(error);
});

module.exports = (request, reply) => {
  const credentials = request.auth.credentials.id;

  isAuthenticated(request, credentials)
    .then(getUser)
    .then(get('projects'))
    .then(setAuthorizationHeader(reply, credentials))
    .then(sendProjects(reply))
    .catch(sendError(reply));
};
