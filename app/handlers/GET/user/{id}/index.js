const Boom = require('boom');
const R = require('ramda');
const Auth = require('../../../../plugins/auth/auth.js');
const User = require('../../../../User/User.js');

/**************************Pure Functions**********************************/

// isAutheticated :: Request -> Promise(ID, Error)
const isAuthenticated = (request) => {
  if (!!request && !!request.auth && !!request.params) {
    return request.auth.isAuthenticated ? Promise.resolve(request.params.id) :
      Promise.reject(request.auth.error);
  }

  return Promise.error(Boom.badRequest('Invalid Request Object'));
};

// getUser :: String -> Promise(User, Error(BadRequest))
const getUser = User.getUser;

// compareId :: String -> User -> Promise(User, Error(Unauthorized))
const compareId = R.curry((id, user) => {
  return (id === user.id) ? Promise.resolve(user) :
    Promise.reject(Boom.unauthorized('Invalid ID: ' + id));
});

// sendUser :: Function -> User -> _
const sendUser = R.curry((fn, user) => {
  fn(user);
});

// sendError -> Function -> Error -> _
const sendError = R.curry((fn, err) => {
  fn(err);
});

/****************************Impure Functions****************************/

module.exports = (request, reply) => {
  let credentials = request.auth.credentials.id;
  let idFromParams = request.params.id;

  isAuthenticated(request)
    .then(getUser)
    .then(compareId(credentials))
    .then(sendUser(reply))
    .catch(sendError(reply));
};
