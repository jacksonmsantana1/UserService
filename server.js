const Hapi = require('hapi');
const server = module.exports = new Hapi.Server();

/***************************Server Config******************************/

server.connection({
  port: 3000,
});

server.auth.scheme('token', require('./app/plugins/auth/auth'));
server.auth.strategy('default', 'token');

const goodConfig = {
  reporters: [
    {
      reporter: require('good-console'),
      events: {
        log: 'Server',
        request: 'Request',
        error: 'ERROR',
      },
    }, {
      config: 'error.log',
      reporter: require('good-file'),
      events: {
        error: '*',
      },
    }, {
      config: 'debug.log',
      reporter: require('good-file'),
      events: {
        log: '*',
        request: '*',
        reponse: '*',
      },
    },
  ],
};

const mongoConfig = (process.env.NODE_ENV === 'test') ?
  require('./app/plugins/mongodb/config.js').test :
  require('./app/plugins/mongodb/config').postman;

/*********************************Plugins**********************************/

//MongoDB
const MongoPlugin = server.register({
  register: require('hapi-mongodb'),
  options: mongoConfig,
});

//Good
const GoodPlugin = server.register({
  register: require('good'),
  options: goodConfig,
});

//Blipp
const BlippPlugin = server.register({
  register: require('blipp'),
  options: {
    showStart: true,
    showAuth: true,
  },
});

//Lout
const LoutPlugin = server.register([require('vision'), require('inert'), require('lout')]);

/**************************Routing************************************/

const routeStart = () => server.route([{
  method: 'GET',
  path: '/user/{id}',
  config: {
    auth: 'default',
  },
  handler: require('./app/handlers/GET/user/id/'),
}, {
  method: 'GET',
  path: '/user/projects',
  config: {
    auth: 'default',
  },
  handler: require('./app/handlers/GET/user/projects/'),
}, {
  method: 'PUT',
  path: '/user/projects/pinned',
  config: {
    auth: 'default',
  },
  handler: require('./app/handlers/PUT/user/projects/pinned/'),
}, {
  method: 'PUT',
  path: '/user/projects/desPinned',
  config: {
    auth: 'default',
  },
  handler: require('./app/handlers/PUT/user/projects/desPinned/'),
}, {
  method: 'GET',
  path: '/user/projects/isPinned/{id}',
  config: {
    auth: 'default',
  },
  handler: require('./app/handlers/GET/user/projects/isPinned/'),
},
]);

/**********************************Start***********************************/
const start = () => {
  routeStart();

  server.log('Server', 'Routing Configured');
  return LoutPlugin;
};

const loutStart = (err) => {
  if (err) {
    server.log('ERROR', 'Lout Error');
    return Promise.reject(err);
  }

  server.log('Server', 'Lout Configured');
  return MongoPlugin;
};

const mongoStart = (err) => {
  if (err) {
    server.log('ERROR', 'MongoDB Error');
    return Promise.reject(err);
  }

  server.log('Server', 'MongoDB running on ' + mongoConfig.url);
  return BlippPlugin;
};

const blippStart = (err) => {
  if (err) {
    server.log('ERROR', 'Blipp Error');
    return Promise.reject(err);
  }

  server.log('Server', 'Blipp Configured');
  return GoodPlugin;
};

/*eslint consistent-return:1*/
const serverStart = (err) => {
  if (err) {
    server.log('ERROR', 'Good Error');
    return Promise.reject(err);
  }

  server.log('Server', 'Good Configured');
  server.start(() => {
    server.log('Server', 'Server running on ' + server.info.uri);
  });
};

const error = (err) => {
  server.log('ERROR', 'Server crashed');
  throw err;
};

start()
  .then(loutStart)
  .then(mongoStart)
  .then(blippStart)
  .then(serverStart)
  .catch(error);
