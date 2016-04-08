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
        pinned: ['12345'],
        liked: [],
        doneProjects: [],
        inProgressProjects: [],
      },
    });
  }

  return Promise.reject(Boom.badRequest('Inexistent ID'));
};

// MOCK
// saveProjectPinned :: Project -> Promise(String, Error)
const savePP = (project) => {
  if (project.id === '123') {
    return Promise.reject(Boom.badImplementation('terrible implementation'));
  }

  return Promise.resolve(project.id);
};

module.exports = {
  getUser: getUserById,
  saveProjectPinned: savePP,
};
