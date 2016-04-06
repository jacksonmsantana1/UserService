'use strict';

var Hapi = require('hapi');
var server = new Hapi.Server();

server.connection({
  port: 3000
});

server.start(function (err) {
  if (err) {
    throw err;
  }

  console.log('Server running at:', server.info.uri);
});