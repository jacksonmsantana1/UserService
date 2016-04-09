const Boom = require('boom');
const curry = require('ramda').curry;
const compose = require('ramda').compose;
const contain = require('ramda').contains;
const get = require('ramda').prop;
const jwt = require('jsonwebtoken');
const key = require('../../../../../../privateKey.js');

// isAutheticated :: Request -> Promise(Payload, Error)
const isAuthenticated = (request) => {
  if (!!request && !!request.auth) {
    return request.auth.isAuthenticated ? Promise.resolve(request.payload) :
      Promise.reject(request.auth.error);
  }

  return Promise.error(Boom.badRequest('Invalid Request Object'));
};

// checkPayload :: Payload -> Promise(String:ID, Error)
const checkPayload = curry((uid, payload) => {
  if (!(!!payload && !!payload.projectId)) {
    return Promise.reject(Boom.badRequest('Missing the Project s ID'));
  }

  return Promise.resolve(uid);
});

// getUser :: String:Credentials -> Promise(User, Error)
const getUser = require('../../../../../User/User.js').getUser;

// getProjectsPinned :: User -> [Project]
const getProjectsPinned = compose(get('pinned'), get('projects'));

// containProject :: String -> [Project] -> Promise(String, Error)
const containProject = curry((pId, arr) => (contain(pId, arr) ?
  Promise.reject(Boom.badRequest('Project already pinned')) :
  Promise.resolve(pId)));

// getProjectFromDB :: String -> Promise(Project, Error)
const getProjectFromDB = require('../../../../../plugins/Project')
  .getProject;

// saveProjectPinned :: String -> Promise(String, Error)
const saveProjectPinned = require('../../../../../User/User.js').saveProjectPinned;

// signNewToken :: User -> Token
const signNewToken = (uid) => {
  const tk = '' + jwt.sign({
      id: uid,
    },
    key, {
      algorithm: 'HS256',
    });
  return tk;
};

// setAuthorizationHeader :: Function -> User -> Promise(String)
const setAuthorizationHeader = curry((reply, uid, pId) => {
  reply(pId).header('authorization', signNewToken(uid));
  return Promise.resolve(pId);
});

// sendResponse :: _ -> Response(200)
const sendResponse = curry((reply, pId) => {
  reply(pId);
});

// sendError :: Error -> Response(Error)
const sendError = curry((reply, err) => {
  reply(err);
});

module.exports = (request, reply) => {
  const projectId = request.payload.projectId;
  const credentials = request.auth.credentials.id;

  isAuthenticated(request)
    .then(checkPayload(credentials))
    .then(getUser)
    .then(getProjectsPinned)
    .then(containProject(projectId))
    .then(getProjectFromDB)
    .then(saveProjectPinned)
    .then(setAuthorizationHeader(reply, credentials))
    .then(sendResponse(reply))
    .catch(sendError(reply));
};
