/**
 * Created by jacksonmartoranosantana on 13/04/16.
 */

module.exports = [{
  id: '1234',
  admin: false,
  email: 'getUser@mail.com',
  password: 'GETTED',
  projects: {
    pinned: ['1234'],
    liked: ['1234'],
    doneProjects: [],
    inProgressProjects: [],
  },
}, {
  id: '1234',
  admin: false,
  email: 'updatedUser@mail.com',
  password: 'UPDATED',
  projects: {
    pinned: ['1234'],
    liked: [],
    doneProjects: [],
    inProgressProjects: [],
  },
}, {
  id: '12345',
  admin: false,
  email: 'savedUser@mail.com',
  password: 'SAVED',
  projects: {
    pinned: ['12345'],
    liked: ['12345', 'test'],
    doneProjects: [],
    inProgressProjects: [],
  },
}, {
  id: '123456',
  admin: false,
  email: 'inexistentUser@mail.com',
  password: 'DONT EXIST',
  projects: {
    pinned: ['123456'],
    liked: [],
    doneProjects: [],
    inProgressProjects: [],
  },
}, {
  id: '123456',
  admin: false,
  email: 'replacedUser@mail.com',
  password: 'REPLACED',
  projects: {
    pinned: ['123456'],
    liked: [],
    doneProjects: [],
    inProgressProjects: [],
  },
}, {
  id: '1234567',
  admin: false,
  email: 'postmanUser@mail.com',
  password: 'POSTMAN',
  projects: {
    pinned: ['1234567'],
    liked: [],
    doneProjects: [],
    inProgressProjects: [],
  },
}, {
  id: 'adminUser',
  admin: true,
  email: 'postmanUser@mail.com',
  password: 'POSTMAN',
  projects: {
    pinned: ['1234567'],
    liked: [],
    doneProjects: [],
    inProgressProjects: [],
  },
},
];

