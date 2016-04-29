const Boom = require('boom');
const R = require('ramda');
const User = require('../../../../User/User.js');

/**************************Pure Functions**********************************/

// isAutheticated :: Request -> Promise(String:paramsId, Error)
const isAuthenticated = (request) => {
  if (request.auth.error) {
    Promise.reject(request.auth.error);
  }

  if (!!request && !!request.auth && !!request.params) {
    return request.auth.isAuthenticated ? Promise.resolve(request.params.id) :
      Promise.reject(request.auth.error);
  }

  return Promise.error(Boom.badRequest('Invalid Request Object'));
};
/*eslint arrow-body-style:1*/

// compareId :: String:credential -> String:paramsId -> Promise(credential, Error(Unauthorized))
const compareId = R.curry((credential, paramsId) =>
                          ((credential === paramsId) ?
                           Promise.resolve(credential) :
                            Promise.reject(Boom.unauthorized('Invalid ID: ' + paramsId))));

// getUser :: Collection:db -> String:credential -> Promise(User, Error(BadRequest))
const getUser = User.getUser;

// deleteUserPws :: User -> Promise(User)
const deleteUserPws = (user) => {
  const us = Object.assign({}, user);
  delete us.password;

  return Promise.resolve(us);
};

// signNewToken :: User -> Token

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
  const credential = request.auth.credentials.id;
  const db = request.server.plugins['hapi-mongodb'].db;
  const collection = db.collection('users');

  isAuthenticated(request)
    .then(compareId(credential))
    .then(getUser(collection))
    .then(deleteUserPws)
    .then(sendUser(reply))
    .catch(sendError(reply));
};
