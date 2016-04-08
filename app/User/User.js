const Boom = require('boom');

// MOCK
const getUserById = (id) => {
  if (id === '1234567890') {
    return Promise.resolve({
      id: '1234567890',
      email: 'jackson@gmail.com',
      password: '1234',
      validToken: '',
      projects: {
        pinned: [],
        liked: [],
        doneProjects: [],
        inProgressProjects: [],
      },
    });
  }

  return Promise.reject(Boom.badRequest('Inexistent ID'));
};

module.exports = { getUser: getUserById };
