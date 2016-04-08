const Lab = require('lab');
const lab = exports.lab = Lab.script();
const expect = require('chai').expect;
const Sinon = require('sinon');
const Jwt = require('jsonwebtoken');

const describe = lab.describe;
const it = lab.it;
const before = lab.before;
const beforeEach = lab.beforeEach;
const afterEach = lab.afterEach;

const server = require('../server.js');

describe('User', () => {

  describe('/user/{id}', () => {
    let privateKey = 'dsakf34CONOUNAclOCUICObl3292weas34gbsLJ32f';

    let tokenHeader = (userId, options) => {
      options = options || {};

      return 'Bearer ' + Jwt.sign({
        id: userId,
      }, privateKey, options);
    };

    let invalidTokenHeader = (userId, options) => {
      options = options || {};

      return 'Bearer ' + Jwt.sign({
        anus: userId,
      }, privateKey, options);
    };

    let invalidTokenKey = (userId, options) => {
      options = options || {};

      return 'Bearer ' + Jwt.sign({
        anus: userId,
      }, 'invalid private key', options);
    };

    it('Should return an error if the request doesn t contain a token', (done) => {
      let options = {
        method: 'GET',
        url: '/user/invalidId',
      };

      server.inject(options, (response) => {
        let result = response.result;

        expect(response.statusCode).to.be.equal(401);
        expect(JSON.parse(response.payload).message).to.be.equal('Missing authentication');
        done();
      });
    });

    it('Should return an error if the token doesn t contain the id value', (done) => {
      let options = {
        method: 'GET',
        url: '/user/invalidId',
        headers: {
          authorization: invalidTokenHeader('123456789'),
        },
      };

      server.inject(options, (response) => {
        let result = response.result;

        expect(response.statusCode).to.be.equal(400);
        expect(JSON.parse(response.payload).message)
          .to.be.equal('Invalid Token - ID value doesnt exist');
        done();
      });
    });

    it('Should return an error if token isn t valid', (done) => {
      let options = {
        method: 'GET',
        url: '/user/1234567890',
        headers: {
          authorization: invalidTokenKey('1234567890'),
        },
      };
      let strError = 'Invalid signature received for JSON Web Token validation';

      server.inject(options, (response) => {
        expect(response.statusCode).to.be.equal(401);
        expect(response.result.message).to.be.equal(strError);
        done();
      });
    });

    it('Should return an error if the token contains an invalid id', (done) => {
      let options = {
        method: 'GET',
        url: '/user/1234567890',
        headers: {
          authorization: tokenHeader('123456789'),
        },
      };

      server.inject(options, (response) => {
        let result = response.result;

        expect(response.statusCode).to.be.equal(401);
        expect(JSON.parse(response.payload).message).to.be.equal('Invalid ID: 123456789');
        done();
      });
    });

    it('Should return an error if the user s id doesnt exist', (done) => {
      let options = {
        method: 'GET',
        url: '/user/1234',
        headers: {
          authorization: tokenHeader('123456789'),
        },
      };

      server.inject(options, (response) => {
        let result = response.result;

        expect(response.statusCode).to.be.equal(400);
        expect(JSON.parse(response.payload).message).to.be.equal('Inexistent ID');
        done();
      });

    });

    it('Should return the user object, also include token, without the password', (done) => {
      let options = {
        method: 'GET',
        url: '/user/1234567890',
        headers: {
          authorization: tokenHeader('1234567890'),
        },
      };

      server.inject(options, (response) => {
        let user = response.result;

        expect(response.statusCode).to.be.equal(200);
        expect(!!response.headers.authorization).to.be.equal(true);
        expect(user.id).to.be.equal('1234567890');
        expect(user.password).to.be.equal(undefined);
        done();
      });
    });
  });

  describe('/user/projects', () => {
    let privateKey = 'dsakf34CONOUNAclOCUICObl3292weas34gbsLJ32f';

    let tokenHeader = (userId, options) => {
      options = options || {};

      return 'Bearer ' + Jwt.sign({
        id: userId,
      }, privateKey, options);
    };

    let invalidTokenHeader = (userId, options) => {
      options = options || {};

      return 'Bearer ' + Jwt.sign({
        anus: userId,
      }, privateKey, options);
    };

    let invalidTokenKey = (userId, options) => {
      options = options || {};

      return 'Bearer ' + Jwt.sign({
        anus: userId,
      }, 'invalid private key', options);
    };

    it('Should be listing to this endpoint', (done) => {
      let options = {
        method: 'GET',
        url: '/user/projects',
        headers: {
          authorization: tokenHeader('1234567890'),
        },
      };

      server.inject(options, (response) => {
        expect(response.statusCode).to.be.equal(200);
        done();
      });

    });

    it('Should return an error if it s missing authentication', (done) => {
      let options = {
        method: 'GET',
        url: '/user/projects',
      };

      server.inject(options, (response) => {
        expect(response.statusCode).to.be.equal(401);
        expect(response.result.message).to.be.equal('Missing authentication');
        done();
      });
    });

    it('Should return an error if token request doesnt contain id s value', (done) => {
      let options = {
        method: 'GET',
        url: '/user/projects',
        headers: {
          authorization: invalidTokenHeader('1234567890'),
        },
      };

      server.inject(options, (response) => {
        expect(response.statusCode).to.be.equal(400);
        expect(response.result.message).to.be.equal('Invalid Token - ID value doesnt exist');
        done();
      });
    });

    it('Should return an error if token isn t valid', (done) => {
      let options = {
        method: 'GET',
        url: '/user/projects',
        headers: {
          authorization: invalidTokenKey('1234567890'),
        },
      };
      let strError = 'Invalid signature received for JSON Web Token validation';

      server.inject(options, (response) => {
        expect(response.statusCode).to.be.equal(401);
        expect(response.result.message).to.be.equal(strError);
        done();
      });
    });

    it('Should return an error if the token s id doenst exists', (done) => {
      let options = {
        method: 'GET',
        url: '/user/projects',
        headers: {
          authorization: tokenHeader('123456789'),
        },
      };
      let strError = 'Inexistent ID';

      server.inject(options, (response) => {
        expect(response.statusCode).to.be.equal(400);
        expect(response.result.message).to.be.equal(strError);
        done();
      });
    });

    it('Should return the User.projects object ', (done) => {
      let options = {
        method: 'GET',
        url: '/user/projects',
        headers: {
          authorization: tokenHeader('1234567890'),
        },
      };

      server.inject(options, (response) => {
        const projects = response.result;

        expect(response.statusCode).to.be.equal(200);
        expect(projects.pinned).to.be.an('array');
        expect(projects.liked).to.be.an('array');
        expect(projects.doneProjects).to.be.an('array');
        expect(projects.inProgressProjects).to.be.an('array');
        done();
      });
    });
  });
});
