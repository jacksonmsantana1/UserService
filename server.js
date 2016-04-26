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
const mongoConfig = (process.env.NODE_ENV === 'test') ?
  require('./app/plugins/mongodb/config.js').test :
  require('./app/plugins/mongodb/config').postman;

const MongoDB = server.register({
  register: require('hapi-mongodb'),
  options: mongoConfig,
});

//TV
const TV = [require('tv'), require('inert'), require('vision')];

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

const mongoStart = (err) => {
  if (err) {
    console.log('MongoDB Error');
    throw err;
  }

  console.log('MongoDB running...');
  console.log(mongoConfig.url);
  server.register(TV);
};

const tvStart = (err) => {
  if (err) {
    console.log('TV Error');
    throw err;
  }

  console.log('TV running...');
  console.log('/debug/console');
  server.start();
};

const serverStart = (err) => {
  if (err) {
    console.log('Server Error');
    throw err;
  }

  console.log('Server running...');
  console.log(server.info.uri);
};

MongoDB
  .then(mongoStart)
  .then(tvStart)
  .then(serverStart);
