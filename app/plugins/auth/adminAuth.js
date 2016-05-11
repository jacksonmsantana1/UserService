const Boom = require('boom');
const logMessage = require('../../plugins/logger/');
const User = require('../../User/User');

const jwt = require('jsonwebtoken');
const KEY = require('../../../privateKey.js');

//ERRORS
const bearerRequired = Boom.unauthorized('Bearer Required');
const tokenRequired = Boom.unauthorized('Token Required');
const invalidSignature = Boom.unauthorized('Invalid Token Signature');
const signatureRequired = Boom.unauthorized('Token Signature is required');
const idRequired = Boom.unauthorized('Token ID required');
const expired = Boom.unauthorized('Token Expired');
const forbidden = Boom.forbidden('Normal User not allowed');

/*eslint consistent-return:1*/
const _authenticate = (request, reply) => {
  const req = request.raw.req;
  const authorization = req.headers.authorization;

  const token = authorization && authorization.split(' ')[1];
  const bearer = authorization && authorization.split(' ')[0];

  const db = request.server.plugins['hapi-mongodb'].db;
  const collection = db.collection('users');

  if (!authorization) {
    request.log('AUTH',
      logMessage(request.id, false, 'undefined', req.url, tokenRequired.message));
    return reply(tokenRequired, null);
  }

  if (bearer !== 'Bearer') {
    request.log('AUTH',
      logMessage(request.id, false, 'undefined', req.url, bearerRequired.message));
    return reply(bearerRequired, null);
  }

  jwt.verify(token, KEY, (err, decoded) => {
    if (err && err.message === 'invalid signature') {
      request.log('AUTH',
        logMessage(request.id, false, 'undefined', req.url, invalidSignature.message));
      return reply(invalidSignature, null);
    } else if (err && err.message === 'jwt signature is required') {
      request.log('AUTH',
        logMessage(request.id, false, 'undefined', req.url, signatureRequired.message));
      return reply(signatureRequired, null);
    } else if (err && err.message === 'jwt expired') {
      request.log('AUTH',
        logMessage(request.id, false, 'undefined', req.url, expired.message));
      return reply(expired, null);
    } else if (err) {
      request.log('AUTH',
        logMessage(request.id, false, 'undefined', req.url, err.message));
      return reply(Boom.badRequest(err.message), null);
    }

    if (!decoded.id) {
      request.log('AUTH',
        logMessage(request.id, false, 'undefined', req.url, idRequired));
      return reply(idRequired, null);
    }

    User.getUser(collection, decoded.id).then((user) => {
      if (user.admin) {
        request.log('AUTH',
          logMessage(request.id, true, decoded.id, req.url, 'Authentication Passed'));
        return reply.continue({ credentials: decoded });
      }

      request.log('AUTH',
        logMessage(request.id, false, 'undefined', req.url, forbidden));
      return reply(forbidden, null);
    });
  });
};

/*eslint no-unused-vars:1*/
module.exports = (server, options) => ({
  authenticate: _authenticate,
});
