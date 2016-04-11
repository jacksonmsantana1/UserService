const Lab = require('lab');
const lab = exports.lab = Lab.script();

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://test:test@ds011429.mlab.com:11429/user';

const expect = require('chai').expect;
const Sinon = require('sinon');

const describe = lab.describe;
const it = lab.it;
const before = lab.before;
const beforeEach = lab.beforeEach;
const after = lab.after;

const server = require('../server.js');

describe('User', () => {
  let userDB;
  let database;

  before((done) => {
    MongoClient.connect(url, (err, db) => {
      if (err) {
        done(err);
      }

      database = db;
      userDB = database.collection('users');
      done();
    });
  });

  after((done) => {
    database.close();
    done();
  });

  it('getUser()', (done) => {
    expect(true).to.be.true;
    done();
  });
});
