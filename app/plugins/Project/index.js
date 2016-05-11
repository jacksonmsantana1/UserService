const Boom = require('boom');
const Wreck = require('wreck');
const ProjectUrl = 'http://localhost:8000/projects';

const _isValid = (id, options, fn) =>
  Wreck.get(ProjectUrl + '/isValid/' + id, options, fn);

const options = {
  headers: {
    authorization: require('../../../admin'),
  },
  json: true,
};

module.exports = {
  isProjectValid: (id) =>
    new Promise((resolve, reject) =>
      _isValid(id, options, (err, res, payload) => {
        if (err) {
          reject(Boom.badGateway(err.message));
        }

        if (!payload && res.statusCode === 200) {
          reject(Boom.badRequest('Project doesn t exist'));
        } else if (payload && res.statusCode === 200) {
          resolve(id);
        }
      })),
};
