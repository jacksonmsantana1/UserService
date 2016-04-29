const Boom = require('boom');
const User = require('../../../../../User/User.js');

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

// sendResponse :: Response -> Boolean:isPin -> Response
const sendResponse = curry((response, isPin) => {
  response(isPin);
});

// sendError :: Response:response -> Error -> Response(Error)
const sendError = curry((response, error) => {
  response(error);
});

module.exports = (request, response) => {
  const projectId = request.params.id;
  const db = request.server.plugins['hapi-mongodb'].db;
  const collection = db.collection('users');

  isAuthenticated(request)
   .then(get('id'))
   .then(getUser(collection))
   .then(get('projects'))
   .then(get('pinned'))
   .then(indexOf(projectId))
   .then(isPinned)
   .then(sendResponse(response))
   .catch(sendError(response));
};
