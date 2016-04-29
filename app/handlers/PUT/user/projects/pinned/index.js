const Boom = require('boom');
const curry = require('ramda').curry;

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

// pinned :: Database -> String:credential -> String:projectId -> Promise(String, Error)
const pinned = require('../../../../../User/User').addPinnedProject;

// sendResponse :: Response:reply -> String:projectId -> Response
const sendResponse = curry((reply, projectId) => {
  reply(projectId);
});

// sendError :: Response:reply -> Error -> Response
const sendError = curry((reply, err) => {
  reply(err);
});

module.exports = (request, reply) => {
  const credential = request.auth.credentials.id;
  const db = request.server.plugins['hapi-mongodb'].db;
  const collection = db.collection('users');

  isAuthenticated(request)
    .then(checkPayload)
    .then(isProjectValid)
    .then(pinned(collection, credential))
    .then(sendResponse(reply))
    .catch(sendError(reply));
};
