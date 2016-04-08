const Boom = require('boom');
const R = require('ramda');
const User = require('../../../../User/User.js');
const jwt = require('jsonwebtoken');
const key = require('../../../../../privateKey.js');

/**************************Pure Functions**********************************/

// isAutheticated :: Request -> Promise(ID, Error)
const isAuthenticated = (request) => {
  if (!!request && !!request.auth && !!request.params) {
    return request.auth.isAuthenticated ? Promise.resolve(request.params.id) :
      Promise.reject(request.auth.error);
  }

  return Promise.error(Boom.badRequest('Invalid Request Object'));
};
/*eslint arrow-body-style:1*/

// getUser :: String -> Promise(User, Error(BadRequest))
const getUser = User.getUser;

// compareId :: String -> User -> Promise(User, Error(Unauthorized))
const compareId = R.curry((id, user) => ((id === user.id) ? Promise.resolve(user) :
    Promise.reject(Boom.unauthorized('Invalid ID: ' + id))));

// deleteUserPws :: User -> Promise(User)
const deleteUserPws = (user) => {
  const us = Object.assign({}, user);
  delete us.password;

  return Promise.resolve(us);
};

// signNewToken :: User -> Token
const signNewToken = (user) => {
  const tk = '' + jwt.sign({
    id: user.id,
  },
    key, {
      algorithm: 'HS256',
    });
  return tk;
};

// setAuthorizationHeader :: Function -> User -> Promise(User)
const setAuthorizationHeader = R.curry((reply, user) => {
  reply(user).header('authorization', signNewToken(user));
  return Promise.resolve(user);
});

// sendUser :: Function -> User -> _
const sendUser = R.curry((reply, user) => {
  reply(user);
});

// sendError -> Function -> Error -> _
const sendError = R.curry((reply, err) => {
  reply(err);
});

/****************************Impure Functions****************************/

module.exports = (request, reply) => {
  const credentials = request.auth.credentials.id;

  isAuthenticated(request)
    .then(getUser)
    .then(compareId(credentials))
    .then(deleteUserPws)
    .then(setAuthorizationHeader(reply))
    .then(sendUser(reply))
    .catch(sendError(reply));
};
