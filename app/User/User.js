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
        pinned: ['12345', '123456789'],
        liked: [],
        doneProjects: [],
        inProgressProjects: [],
      },
    });
  }

  return Promise.reject(Boom.badRequest('Inexistent ID'));
};

// MOCK
const _saveUser = (user) => {
  if (user.id === '1234567890') {
    return Promise.resolve(user);
  }

  return Promise.reject(Boom.badImplementation('Something Occured'));
};

//MOCK
const _updateUser = (user) => {
  if (user.id === '1234567890') {
    return Promise.resolve(user);
  }

  return Promise.reject(Boom.badImplementation('Something Occured'));
};

module.exports = {
  getUser: getUserById,
  saveUser: _saveUser,
  updateUser: _updateUser,
};
