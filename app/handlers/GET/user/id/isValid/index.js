const Boom = require('boom');
const R = require('ramda');
const User = require('../../../../../User/User.js');
const logMessage = require('../../../../../plugins/logger/');

// isAutheticated :: Request -> Promise(String:credential, Error)
const isAuthenticated = (request) => {
  if (request.auth.error) {
    Promise.reject(request.auth.error);
  }

  if (!!request && !!request.auth && !!request.params) {
    return request.auth.isAuthenticated ? Promise.resolve(request.auth.credentials.id) :
      Promise.reject(request.auth.error);
  }

  return Promise.reject(Boom.badRequest('Invalid Request Object'));
};

// getUser :: Collection:db -> String:credential -> Promise(User, Error(BadRequest))
const getUser = User.getUser;

const isAdmin = R.curry((paramsId, user) => {
  if (!!user.admin) {
    return Promise.resolve(paramsId);
  }

  return Promise.reject(Boom.forbidden('Normal User not allowed'));
});

// sendUser :: Request -> Response -> User -> Response(User)
const sendUser = R.curry((request, reply, user) => {
  request.log('/user/{id}/isValid',
    logMessage(request.id, true, request.auth.credentials.id, request.path, 'OK 200'));
  reply(!!user);
});

// sendError -> Request -> Response -> Response(Error)
const sendError = R.curry((request, reply, err) => {
  if (err.message === 'Inexistent User') {
    request.log('/user/{id}/isValid',
      logMessage(request.id, true, request.auth.credentials.id, request.path, 'OK 200'));
    reply(false);
  }

  request.log('ERROR',
    logMessage(request.id, false, request.auth.credentials.id, request.path, err.message));
  reply(err);
});

/****************************Impure Functions****************************/

module.exports = (request, reply) => {
  const credential = request.auth.credentials.id;
  const paramsId = request.params.id;
  const db = request.server.plugins['hapi-mongodb'].db;
  const collection = db.collection('users');

  request.log('/user/{id}',
    logMessage(request.id, true, credential, request.path, 'Endpoint reached'));
  isAuthenticated(request)
    .then(getUser(collection))
    .then(isAdmin(paramsId))
    .then(getUser(collection))
    .then(sendUser(request, reply))
    .catch(sendError(request, reply));
};
