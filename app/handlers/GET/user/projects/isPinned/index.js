const Boom = require('boom');
const User = require('../../../../../User/User.js');
const logMessage = require('../../../../../plugins/logger/');

const get = require('ramda').prop;
const indexOf = require('ramda').indexOf;
const curry = require('ramda').curry;

// isAuthenticated :: (Request) -> Promise(Request, Error)
const isAuthenticated = (request) => {
  if (!!request && !!request.auth && !!request.params) {
    return request.auth.isAuthenticated ? Promise.resolve(request.auth.credentials) :
      Promise.reject(request.auth.error);
  }

  return Promise.reject(Boom.badImplementation('Invalid Request Object'));
};

// getUser :: Collection:db -> String:credential -> Promise(User, Error(BadRequest))
const getUser = User.getUser;

// isPinned :: Number:index -> Promise(true||false)
const isPinned = (index) => ((index === -1) ?
  Promise.resolve(false) :
  Promise.resolve(true));

// sendResponse ::Request -> Response -> Boolean:isPin -> Response(Boolean)
const sendResponse = curry((request, response, isPin) => {
  request.log('/user/projects/isPinned/{id}',
    logMessage(request.id, true, request.auth.credentials.id, request.path, 'OK 200'));
  response(isPin);
});

// sendError :: Request -> Response -> Error -> Response(Error)
const sendError = curry((request, response, error) => {
  request.log('ERROR',
    logMessage(request.id, false, request.auth.credentials.id, request.path, error.message));
  response(error);
});

module.exports = (request, response) => {
  const projectId = request.params.id;
  const credential = request.auth.credentials.id;
  const db = request.server.plugins['hapi-mongodb'].db;
  const collection = db.collection('users');

  request.log('/user/projects/isPinned/{id}',
    logMessage(request.id, true, credential, request.path, 'Endpoint reached'));
  isAuthenticated(request)
   .then(get('id'))
   .then(getUser(collection))
   .then(get('projects'))
   .then(get('pinned'))
   .then(indexOf(projectId))
   .then(isPinned)
   .then(sendResponse(request, response))
   .catch(sendError(request, response));
};
