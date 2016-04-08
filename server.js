const Hapi = require('hapi');
const server = module.exports = new Hapi.Server();
const Auth = require('./app/plugins/auth/auth.js');

/***************************Server Config******************************/

server.connection({
  port: 3000,
});

server.register(require('hapi-auth-jwt'), Auth(server));

server.route([{
  method: 'GET',
  path: '/user/{id}',
  config: {
    auth: 'token',
  },
  handler: require('./app/handlers/GET/user/{id}/'),
}, {
  method: 'GET',
  path: '/user/projects',
  config: {
    auth: 'token',
  },
  handler: require('./app/handlers/GET/user/projects/'),
},
]);

/**********************************Start***********************************/

server.start((err) => {
  if (err) {
    throw err;
  }

  console.log('Server running at:', server.info.uri);
});
