const Boom = require('boom');
const jwt = require('jsonwebtoken');
const KEY = require('../../../privateKey.js');

//ERRORS
const bearerRequired = Boom.unauthorized('Bearer Required');
const tokenRequired = Boom.unauthorized('Token Required');
const invalidSignature = Boom.unauthorized('Invalid Token Signature');
const signatureRequired = Boom.unauthorized('Token Signature is required');
const idRequired = Boom.unauthorized('Token ID required');
const expired = Boom.unauthorized('Token Expired');

/*eslint consistent-return:1*/
const _authenticate = (request, reply) => {
  const req = request.raw.req;
  const authorization = req.headers.authorization;
  const token = authorization && authorization.split(' ')[1];
  const bearer = authorization && authorization.split(' ')[0];

  if (!authorization) {
    return reply(tokenRequired, null);
  }

  if (bearer !== 'Bearer') {
    return reply(bearerRequired, null);
  }

  jwt.verify(token, KEY, (err, decoded) => {
    if (err && err.message === 'invalid signature') {
      return reply(invalidSignature, null);
    } else if (err && err.message === 'jwt signature is required') {
      return reply(signatureRequired, null);
    } else if (err && err.message === 'jwt expired') {
      return reply(expired, null);
    } else if (err) {
      return reply(Boom.badRequest('Unknown Token Error'), null);
    }

    if (!decoded.id) {
      return reply(idRequired, null);
    }

    return reply.continue({ credentials: decoded });
  });
};

/*eslint no-unused-vars:1*/
module.exports = (server, options) => ({
  authenticate: _authenticate,
});
