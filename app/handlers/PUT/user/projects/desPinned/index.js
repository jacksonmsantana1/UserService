const Boom = require('boom');
const jwt = require('jsonwebtoken');
const key = require('../../../../../../privateKey.js');

const curry = require('ramda').curry;
const compose = require('ramda').compose;
const lensProp = require('ramda').lensProp;
const set = require('ramda').set;
const get = require('ramda').prop;
const filter = require('ramda').filter;
const uniq = require('ramda').uniq;
const contains = require('ramda').contains;

// isAutheticated :: Request -> Promise(RequestPayload, Error)
const isAuthenticated = (request) => {
  if (!!request && !!request.auth) {
    return request.auth.isAuthenticated ? Promise.resolve(request.payload) :
      Promise.reject(request.auth.error);
  }

  return Promise.error(Boom.badRequest('Invalid Request Object'));
};

// checkPayload :: RequestPayload
const checkPayload = (payload) => {
  if (!!payload && !!payload.projectId) {
    return Promise.resolve(payload.projectId);
  }

  return Promise.reject(Boom.badRequest('Missing the Project s ID'));
};

// isProjectValid :: String:projectId -> Promise(String:projectId, Error)
const isProjectValid = require('../../../../../plugins/Project/').isValid;

// getUser :: String:credential -> Promise(User, Error)
const getUser = require('../../../../../User/User.js').getUser;

// setPinnedProjects :: String:projectId -> User: user -> User: user
const setPinnedProjects = curry((projectId, user) => {
  const projectsLens = lensProp('projects');
  const pinnedLens = lensProp('pinned');
  const lenses = compose(projectsLens, pinnedLens);

  const fn = compose(filter(id => id !== projectId),
    uniq,
    get('pinned'),
    get('projects'));

  return set(lenses, fn(user), user);
});

// isPinned :: String:projectID -> User -> Promise(User, Error)
const isPinned = curry((projectId, user) => {
  const fn = compose(contains(projectId), get('pinned'), get('projects'));

  return fn(user) ? Promise.resolve(user) :
    Promise.reject(Boom.badRequest('Can t despin this project'));
});

// setUser :: String:credential -> String:projectId -> User
const setUser = curry((credential, projectId) => getUser(credential)
    .then(isPinned(projectId))
    .then(setPinnedProjects(projectId)));

// updateUser :: User -> Promise(User, Error)
const updateUser = require('../../../../../User/User.js').updateUser;

// signNewToken :: String:credential -> Token
const signNewToken = (credential) => jwt.sign({ id: credential }, key, { algorithm: 'HS256' });

// sendResponse :: Function -> String:projectId -> Response
const sendResponse = curry((reply, projectId, user) => {
  reply(projectId).header('authorization', signNewToken(user.id));
  reply(projectId);
});

// sendError :: Function -> Error -> Response
const sendError = curry((reply, err) => {
  reply(err);
});

module.exports = (request, reply) => {
  const credential = request.auth.credentials.id;
  const projectId = request.payload.projectId;

  isAuthenticated(request)
    .then(checkPayload)
    .then(isProjectValid)
    .then(setUser(credential))
    .then(updateUser)
    .then(sendResponse(reply, projectId))
    .catch(sendError(reply));
};
