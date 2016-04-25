const Boom = require('boom');
const curry = require('ramda').curry;
const get = require('ramda').prop;
const nth = require('ramda').nth;
const compose = require('ramda').compose;
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

// checkPayload ::  Payload:payload -> Promise(String:projectId, Error)
const checkPayload = curry((payload) => {
  if (!!payload && !!payload.projectId) {
    return Promise.resolve(payload.projectId);
  }

  return Promise.reject(Boom.badRequest('Missing the Project s ID'));
});

// isProjectValid :: String:projectId -> Promise(String:projectId, Error)
const isProjectValid = require('../../../../../plugins/Project/').isValid;

// getUser :: Collection:db -> String:credential -> Promise(User, Error)
const getUser = require('../../../../../User/User.js').getUser;

// clone :: User -> User
const clone = (user) => Object.assign(user, {});

// isPinned :: String:projectId -> User:user -> Promise(User, Error)
const isPinned = curry((projectId, user) => {
  if (user.projects.pinned.indexOf(projectId) !== -1) {
    return Promise.reject(Boom.badRequest('Project already pinned'));
  }

  return Promise.resolve(user);
});

// addPinnedProject :: User:user -> String:projectId -> Promise(User, Error)
const addPinnedProject = curry((projectId, user) => {
  if (!!user && !!user.projects && !!user.projects.pinned) {
    user.projects.pinned.push(projectId);
    return Promise.resolve(user);
  }

  return Promise.reject(Boom.badRequest('Invalid User'));
});

// replaceUser :: User -> Promise(User, Error)
const replaceUser = require('../../../../../User/User.js').replaceUser;

// updateUser :: Collection:db  String:credential -> String:projectId
const updateUser = curry((db, credential, projectId) => getUser(db, credential)
    .then(isPinned(projectId))
    .then(clone)
    .then(addPinnedProject(projectId)));

// getId :: ? -> String:uid
const getId = compose(get('id'), nth(0), get('ops'));

// signNewToken :: String:uid -> Token
const signNewToken = (uid) => jwt.sign({ id: uid }, key, { algorithm: 'HS256' });

// sendResponse :: Function:reply -> String:pId -> String:uid -> Response
const sendResponse = curry((reply, pId, uid) => {
  reply(pId).header('authorization', signNewToken(uid));
  reply(pId);
});

// sendError :: Function:reply -> Error -> Response
const sendError = curry((reply, err) => {
  reply(err);
});

module.exports = (request, reply) => {
  const projectId = request.payload.projectId;
  const credential = request.auth.credentials.id;
  const db = request.server.plugins['hapi-mongodb'].db;
  const collection = db.collection('users');

  isAuthenticated(request)
    .then(checkPayload)
    .then(isProjectValid)
    .then(updateUser(collection, credential))
    .then(replaceUser(collection, credential))
    .then(getId)
    .then(sendResponse(reply, projectId))
    .catch(sendError(reply));
};
