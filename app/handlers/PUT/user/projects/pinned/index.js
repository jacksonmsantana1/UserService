const Boom = require('boom');
const logMessage = require('../../../../../plugins/logger/');

const curry = require('ramda').curry;
const get = require('ramda').prop;

// isAutheticated :: Request -> Promise(Payload, Error)
const isAuthenticated = (request) => {
  if (!!request && !!request.auth) {
    return request.auth.isAuthenticated ? Promise.resolve(request.payload) :
      Promise.reject(request.auth.error);
  }

  return Promise.error(Boom.badRequest('Invalid Request Object'));
};

// isProjectValid :: String:projectId -> Promise(String:projectId, Error)
const isProjectValid = require('../../../../../plugins/Project/').isProjectValid;

// pinned :: Database -> String:credential -> String:projectId -> Promise(String, Error)
const pinned = require('../../../../../User/User').addPinnedProject;

// sendResponse :: Request -> Response -> String:projectId -> Response
const sendResponse = curry((request, reply, projectId) => {
  request.log('/user/projects/pinned',
    logMessage(request.id, true, request.auth.credentials.id, request.path, 'OK 200'));
  reply(projectId);
});

// sendError :: Request -> Response -> Response(Error)
const sendError = curry((request, reply, err) => {
  request.log('ERROR',
    logMessage(request.id, false, request.auth.credentials.id, request.path, err.message));
  reply(err);
});

module.exports = (request, reply) => {
  const credential = request.auth.credentials.id;
  const db = request.server.plugins['hapi-mongodb'].db;
  const collection = db.collection('users');

  request.log('/user/projects/pinned',
    logMessage(request.id, true, credential, request.path, 'Endpoint reached'));
  isAuthenticated(request)
    .then(get('projectId'))
    .then(isProjectValid)
    .then(pinned(collection, credential))
    .then(sendResponse(request, reply))
    .catch(sendError(request, reply));
};
