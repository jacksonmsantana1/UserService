// This service will connect with the Projects  Microservice

const Boom = require('boom');

//MOCK
module.exports = {
  getProject: (id) => {
    if (id === '1234567890' || id === '12345') {
      return Promise.resolve({
        id: '' + id,
        name: 'Patchwork Project 1',
      });
    }

    return Promise.reject(Boom.badRequest('Project doesn t exist'));
  },
};
