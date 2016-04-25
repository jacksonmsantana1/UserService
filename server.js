const Hapi = require('hapi');
const server = module.exports = new Hapi.Server();
const Auth = require('./app/plugins/auth/auth.js');

/***************************Server Config******************************/

server.connection({
  port: 3000,
});

/*********************************Plugins**********************************/

//Auth
server.register(require('hapi-auth-jwt'), Auth(server));

//MongoDB
const MongoDB = server.register({
  register: require('hapi-mongodb'),
  options: require('./app/plugins/mongodb/config.js').opts,
});

/**************************Routing************************************/

server.route([{
  method: 'GET',
  path: '/user/{id}',
  config: {
    auth: 'token',
  },
  handler: require('./app/handlers/GET/user/id/'),
}, {
  method: 'GET',
  path: '/user/projects',
  config: {
    auth: 'token',
  },
  handler: require('./app/handlers/GET/user/projects/'),
}, {
  method: 'POST',
  path: '/user/projects/pinned',
  config: {
    auth: 'token',
  },
  handler: require('./app/handlers/POST/user/projects/pinned/'),
}, {
  method: 'PUT',
  path: '/user/projects/desPinned',
  config: {
    auth: 'token',
  },
  handler: require('./app/handlers/PUT/user/projects/desPinned/'),
}, {
  method: 'GET',
  path: '/user/projects/isPinned/{id}',
  config: {
    auth: 'token',
  },
  handler: require('./app/handlers/GET/user/projects/isPinned/'),
},
]);

/**********************************Start***********************************/

const startServer = (err) => {
  if (err) {
    throw err;
  }

  console.log('MongoDB running...');
  server.start();
};

MongoDB
  .then(startServer)
  .then((err) => {
    if (err) {
      throw err;
    }

    console.log('Server running...');
  });
