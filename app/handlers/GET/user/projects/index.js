const curry = require('ramda').curry;
const Boom = require('boom');

// getUser :: String -> Promise(User, Error)
const getUser = require('../../../../User/User.js').getUser;

// isAutheticated :: Request -> Promise(ID, Error)
const isAuthenticated = (request, credentials) => {
  if (!!request && !!request.auth && !!request.params) {
    return request.auth.isAuthenticated ? Promise.resolve(credentials) :
      Promise.reject(request.auth.error);
  }

  return Promise.error(Boom.badImplementation('Invalid Request Object'));
};

// sendProjects :: User -> Response(User, Error)
const sendProjects = curry((reply, user) => {
  if (!!user && !!user.projects) {
    reply(user.projects);
  }

  reply(Boom.badImplementation('Invalid User Retreived'));
});

// sendError :: Response -> Error -> Response(Error)
const sendError = curry((reply, error) => {
  reply(error);
});

module.exports = (request, reply) => {
  const credentials = request.auth.credentials.id;

  isAuthenticated(request, credentials)
    .then(getUser)
    .then(sendProjects(reply))
    .catch(sendError(reply));
};
