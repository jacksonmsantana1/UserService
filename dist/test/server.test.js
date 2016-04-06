'use strict';

var Lab = require('lab');
var expect = require('chai').expect;
var lab = exports.lab = Lab.script();
var server = require('../../server.js');

var describe = lab.describe;
var it = lab.it;
var before = lab.before;
var after = lab.after;
var user = require("../../user.json");

describe('User', function () {

  before(function (done) {
    done();
  });

  after(function (done) {
    done();
  });

  describe('/user/{id}', function () {

    it('200 -> Should return the user object', function (done) {
      var options = {
        method: "GET",
        url: "/user/9203409ns234294d"
      };

      server.inject(options, function (response) {
        var result = response.result;

        expect(response.statusCode).to.be.equal(200);
        expect(result.email).to.be.equal('jackson@gmail.com');

        done();
      });
    });
  });
});