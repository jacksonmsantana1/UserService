const Hapi = require('hapi');
const server = module.exports = new Hapi.Server();

/***************************Server Config******************************/

server.connection({
  port: 3000,
});

server.auth.scheme('token', require('./app/plugins/auth/auth'));
server.auth.strategy('default', 'token');

const goodConfig = {
  reporters: {
    console: [{
      module: 'good-squeeze',
      name: 'Squeeze',
      args: [{ log: '*', request: '*', response: '*' }],
    }, {
      module: 'good-console',
    },
      'stdout',
    ],
  },
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

//TV
const TvPlugin = server.register(require('tv'));

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
}, {
  method: 'GET',
  path: '/token',
  config: {
    auth: false,
  },
  handler: require('./app/handlers/GET/user/token/'),
},
]);

/**********************************Start***********************************/
const start = () => {
  routeStart();

  console.info('/*****************Routes****************/\n');
  console.info('Routing running...\n');
  return MongoPlugin;
};

const mongoStart = (err) => {
  if (err) {
    console.info('/-----------------ERROR------------------/\n');
    console.error('MongoDB Error');
    throw err;
  }

  console.info('/*****************MongoDB****************/\n');
  console.info('MongoDB running...');
  console.info('-> ' + mongoConfig.url + '\n');
  TvPlugin;
};

const tvStart = (err) => {
  if (err) {
    console.info('/-----------------ERROR------------------/\n');
    console.error('TV Error');
    throw err;
  }

  console.info('/*****************TV****************/\n');
  console.info('TV running...');
  console.info('-> /debug/console\n');
  BlippPlugin;
};

const blippStart = (err) => {
  if (err) {
    console.info('/-----------------ERROR------------------/\n');
    console.error('Blipp Error');
    throw err;
  }

  console.info('/*****************Blipp****************/\n');
  console.info('Blipp running...\n');
  GoodPlugin;
};

const serverStart = (err) => {
  if (err) {
    console.info('/-----------------ERROR------------------/\n');
    console.error('Good Error');
    throw err;
  }

  console.info('/*****************Good****************/\n');
  console.info('Good running...\n');
  server.start(() => {
    console.info('/*****************Server****************/\n');
    console.info('Server running...');
    console.info(server.info.uri + '\n');
  });
};

start()
  .then(mongoStart)
  .then(tvStart)
  .then(blippStart)
  .then(serverStart);
