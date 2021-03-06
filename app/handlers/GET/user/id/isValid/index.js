const Boom = require('boom');
const User = require('../../../../../User/User.js');
const logMessage = require('../../../../../plugins/logger/');

const compose = require('ramda').compose;
const curry = require('ramda').curry;
const get = require('ramda').prop;

// isAutheticated :: Request -> Promise(Request, Error)
const isAuthenticated = (request) => {
  if (request.auth.error) {
    Promise.reject(request.auth.error);
  }

  if (!!request && !!request.auth && !!request.params) {
    return request.auth.isAuthenticated ? Promise.resolve(request) :
      Promise.reject(request.auth.error);
  }

  return Promise.reject(Boom.badRequest('Invalid Request Object'));
};

// getParamsId :: Request -> String:paramsId
const getParamsId = compose(get('id'), get('params'));

// getUser :: Collection:db -> String:paramsId -> Promise(User, Error(BadRequest))
const getUser = User.getUser;

// sendUser :: Request -> Response -> User -> Response(User)
const sendUser = curry((request, reply, user) => {
  request.log('/user/{id}/isValid',
    logMessage(request.id, true, request.auth.credentials.id, request.path, 'OK 200'));
  reply(!!user);
});

// sendError -> Request -> Response -> Response(Error)
const sendError = curry((request, reply, err) => {
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
  const db = request.server.plugins['hapi-mongodb'].db;
  const collection = db.collection('users');

  request.log('/user/{id}/isValid',
    logMessage(request.id, true, request.auth.credentials.id, request.path, 'Endpoint reached'));
  isAuthenticated(request)
    .then(getParamsId)
    .then(getUser(collection))
    .then(sendUser(request, reply))
    .catch(sendError(request, reply));
};
