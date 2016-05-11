const Boom = require('boom');
const User = require('../../../../../User/User.js');
const logMessage = require('../../../../../plugins/logger/');

const curry = require('ramda').curry;
const compose = require('ramda').compose;
const get = require('ramda').prop;

// isAutheticated :: Request -> Promise(Request, Error)
const isAuthenticated = (request) => {
  if (request.auth.error) {
    Promise.reject(request.auth.error);
  }

  if (!!request && !!request.auth) {
    return request.auth.isAuthenticated ? Promise.resolve(request) :
      Promise.reject(request.auth.error);
  }

  return Promise.reject(Boom.badRequest('Invalid Request Object'));
};

// getParamsId :: Request -> String:paramsId
const getParamsId = compose(get('id'), get('params'));

// getUser :: Collection:db -> String:paramsId -> Promise(User, Error(BadRequest))
const getUser = User.getUser;

// isUserAdmin :: User -> Promise(Error, Boolean:isAdmin)
const isUserAdmin = (user) => {
  if (!user.admin) {
    return Promise.resolve(false);
  }

  return Promise.resolve(true);
};

// sendUser :: Request -> Response -> Boolean:isAdmin -> Response(Boolean:isAdmin)
const sendUser = curry((request, reply, isAdmin) => {
  request.log('/user/{id}/isAdmin',
    logMessage(request.id, true, request.auth.credentials.id, request.path, 'OK 200'));
  reply(isAdmin);
});

// sendError -> Request -> Response -> Response(Error)
const sendError = curry((request, reply, err) => {
  request.log('ERROR',
    logMessage(request.id, false, request.auth.credentials.id, request.path, err.message));
  reply(err);
});

/****************************Impure Functions****************************/

module.exports = (request, reply) => {
  const db = request.server.plugins['hapi-mongodb'].db;
  const collection = db.collection('users');

  request.log('/user/{id}/isAdmin',
    logMessage(request.id, true, request.auth.credentials.id, request.path, 'Endpoint reached'));
  isAuthenticated(request)
    .then(getParamsId)
    .then(getUser(collection))
    .then(isUserAdmin)
    .then(sendUser(request, reply))
    .catch(sendError(request, reply));
};
