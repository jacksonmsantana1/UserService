const Boom = require('boom');
const logMessage = require('../../../../plugins/logger/');

const curry = require('ramda').curry;
const get = require('ramda').prop;

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

// sendProjects :: Request -> Response -> [Project] -> Response([Project], Error)
const sendProjects = curry((request, reply, projects) => {
  request.log('/user/projects',
    logMessage(request.id, true, request.auth.credentials.id, request.path, 'OK 200'));
  reply(projects);
});

// sendError :: Request -> Response -> Error -> Response(Error)
const sendError = curry((request, reply, error) => {
  request.log('ERROR',
    logMessage(request.id, false, request.auth.credentials.id, request.path, error.message));
  reply(error);
});

module.exports = (request, reply) => {
  const credential = request.auth.credentials.id;
  const db = request.server.plugins['hapi-mongodb'].db;
  const collection = db.collection('users');

  request.log('/user/projects',
    logMessage(request.id, true, credential, request.path, 'Endpoint reached'));
  isAuthenticated(request, credential)
    .then(getUser(collection))
    .then(get('projects'))
    .then(sendProjects(request, reply))
    .catch(sendError(request, reply));
};
