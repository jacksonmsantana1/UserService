const Boom = require('boom');
const curry = require('ramda').curry;
const get = require('ramda').prop;

// isAutheticated :: Request -> Promise(RequestPayload, Error)
const isAuthenticated = (request) => {
  if (!!request && !!request.auth) {
    return request.auth.isAuthenticated ? Promise.resolve(request.payload) :
      Promise.reject(request.auth.error);
  }

  return Promise.error(Boom.badRequest('Invalid Request Object'));
};

// isProjectValid :: String:projectId -> Promise(String:projectId, Error)
const isProjectValid = require('../../../../../plugins/Project/').isValid;

// despin :: Collection:db -> String:credential -> String:projectId -> Promise(String, Error)
const despin = require('../../../../../User/User.js').removePinnedProject;

// sendResponse :: Response -> String:projectId -> Response
const sendResponse = curry((reply, projectId) => {
  reply(projectId);
});

// sendError :: Response -> Error -> Response
const sendError = curry((reply, err) => {
  reply(err);
});

module.exports = (request, reply) => {
  const credential = request.auth.credentials.id;
  const db = request.server.plugins['hapi-mongodb'].db;
  const collection = db.collection('users');

  isAuthenticated(request)
    .then(get('projectId'))
    .then(isProjectValid)
    .then(despin(collection, credential))
    .then(sendResponse(reply))
    .catch(sendError(reply));
};
