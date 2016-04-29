const curry = require('ramda').curry;
const get = require('ramda').prop;
const Boom = require('boom');

// isAutheticated :: (Request, String:credential) -> Promise(ID, Error)
const isAuthenticated = (request, credential) => {
  if (!!request && !!request.auth && !!request.params) {
    return request.auth.isAuthenticated ? Promise.resolve(credential) :
      Promise.reject(request.auth.error);
  }

  return Promise.error(Boom.badImplementation('Invalid Request Object'));
};

// getUser :: Collection:db -> Collection -> String:uid -> Promise(User, Error)
const getUser = require('../../../../User/User.js').getUser;

// sendProjects :: Function:reply -> [Project] -> Response([Project], Error)
const sendProjects = curry((reply, projects) => {
  if (!!projects) {
    reply(projects);
  }

  reply(Boom.badImplementation('Invalid User Projects'));
});

// sendError :: Function:reply -> Error -> Response(Error)
const sendError = curry((reply, error) => {
  reply(error);
});

module.exports = (request, reply) => {
  const credential = request.auth.credentials.id;
  const db = request.server.plugins['hapi-mongodb'].db;
  const collection = db.collection('users');

  isAuthenticated(request, credential)
    .then(getUser(collection))
    .then(get('projects'))
    .then(sendProjects(reply))
    .catch(sendError(reply));
};
