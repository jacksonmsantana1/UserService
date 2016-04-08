const Boom = require('boom');
const curry = require('ramda').curry;
const compose = require('ramda').compose;
const contain = require('ramda').contains;
const get = require('ramda').prop;

// isAutheticated :: Request -> Promise(Payload, Error)
const isAuthenticated = (request) => {
  if (!!request && !!request.auth) {
    return request.auth.isAuthenticated ? Promise.resolve(request.payload) :
      Promise.reject(request.auth.error);
  }

  return Promise.error(Boom.badRequest('Invalid Request Object'));
};

// checkPayload :: Payload -> Promise(String:ID, Error)
const checkPayload = (payload) => {
  if (!(!!payload && !!payload.projectId)) {
    return Promise.reject(Boom.badRequest('Missing the Project s ID'));
  } else if (!(!!payload && !!payload.id)) {
    return Promise.reject(Boom.badRequest('Missing the User s ID'));
  }

  return Promise.resolve(payload.id);
};

// checkUserId :: String:Credentials -> String:ID -> Promise(String:Credentials, Error)
const checkUserId = curry((credentials, id) => ((credentials === id) ?
  Promise.resolve(credentials) :
  Promise.reject(Boom.badRequest('User ID invalid'))));

// getUser :: String:Credentials -> Promise(User, Error)
const getUser = require('../../../../../User/User.js').getUser;

// getProjectsPinned :: User -> [Project]
const getProjectsPinned = compose(get('pinned'), get('projects'));

// containProject :: String -> [Project] -> Promise(String, Error)
const containProject = curry((pId, arr) => (contain(pId, arr) ?
    Promise.reject(Boom.badRequest('Project already pinned')) :
    Promise.resolve(pId)));

// getProjectFromDB :: String -> Promise(Project, Error)
const getProjectFromDB = require('../../../../../plugins/Project')
  .getProject;

// saveProjectPinned :: String -> Promise(String, Error)
const saveProjectPinned = require('../../../../../User/User.js').saveProjectPinned;

// sendResponse :: _ -> Response(200)
const sendResponse = curry((reply, projectId) => {
  reply(projectId);
});

// sendError :: Error -> Response(Error)
const sendError = curry((reply, err) => {
  reply(err);
});

module.exports = (request, reply) => {
  const projectId = request.payload.projectId;
  const credentials = request.auth.credentials.id;

  isAuthenticated(request)
    .then(checkPayload)
    .then(checkUserId(credentials))
    .then(getUser)
    .then(getProjectsPinned)
    .then(containProject(projectId))
    .then(getProjectFromDB)
    .then(saveProjectPinned)
    .then(sendResponse(reply))
    .catch(sendError(reply));
};
