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
const request = require('request');
const user = require('../user.json');

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

    beforeEach((done) => {
      done();
    });

    afterEach((done) => {
      done();
    });

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

    it('Should return the user object', (done) => {
      let options = {
        method: 'GET',
        url: '/user/1234567890',
        headers: {
          authorization: tokenHeader('1234567890'),
        },
      };

      server.inject(options, (response) => {
        let result = response.result;

        expect(response.statusCode).to.be.equal(200);
        done();
      });
    });
  });
});
