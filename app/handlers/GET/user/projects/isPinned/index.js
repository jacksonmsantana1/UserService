const Boom = require('boom');
const User = require('../../../../../User/User.js');

const get = require('ramda').prop;
const indexOf = require('ramda').indexOf;
const curry = require('ramda').curry;

// isAutheticated :: (Request, String:credential) -> Promise(Request, Error)
const isAuthenticated = (request, credential) => {
  if (!!request && !!request.auth) {
    return request.auth.isAuthenticated ? Promise.resolve(credential) :
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

// sendResponse :: Response -> String:credential -> Boolean:isPin -> Response
const sendResponse = curry((response, credential, isPin) => {
  response(isPin);
});

// sendError :: Response:response -> Error -> Response(Error)
const sendError = curry((response, error) => {
  response(error);
});

module.exports = (request, response) => {
  const credential = request.auth.credentials.id;
  const projectId = request.params.id;
  const db = request.server.plugins['hapi-mongodb'].db;
  const collection = db.collection('users');

  isAuthenticated(request, credential)
   .then(getUser(collection))
   .then(get('projects'))
   .then(get('pinned'))
   .then(indexOf(projectId))
   .then(isPinned)
   .then(sendResponse(response, credential))
   .catch(sendError(response));
};
