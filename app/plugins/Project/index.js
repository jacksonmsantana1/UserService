// This service will connect with the Projects  Microservice
// MOCKING

const Boom = require('boom');

//MOCK
module.exports = {
  getProject: (id) => {
    if (id === '1234567890' || id === '12345') {
      return Promise.resolve({
        id: '' + id,
        name: 'Patchwork Project 1',
      });
    } else if (id === '12345678') {
      return Promise.resolve({
        id: '' + id,
        name: 'Patchwork Project 2',
      });
    }

    return Promise.reject(Boom.badRequest('Project doesn t exist'));
  },

  isValid: (id) => {
    if (id === 'DONT EXIST') {
      return Promise.reject(Boom.badRequest('Project doesn t exist'));
    }

    return Promise.resolve(id);
  },
};
