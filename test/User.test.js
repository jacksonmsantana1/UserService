const Lab = require('lab');
const lab = exports.lab = Lab.script();
const Joi = require('joi');

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://127.0.0.1:27017/test';

const expect = require('chai').expect;
const describe = lab.describe;
const it = lab.it;
const before = lab.before;
const after = lab.after;

const User = require('../app/User/User.js');
const UserModel = require('../app/User/UserModel');
const server = require('../server.js');
const users = require('./usersMock.js');

describe('User', () => {
  let userDB;
  let invalidDB;
  let database;

  before((done) => {
    MongoClient.connect(url, (err, db) => {
      if (err) {
        done(err);
      }

      console.log('=>=>=> Connected...');

      database = db;
      invalidDB = database.collection('invalid');
      userDB = database.collection('users');

      userDB.insert(users[0])
        .then(userDB.insert(users[2]))
        .then((user) => {
          console.log('Saved user: ' + users[0].id);
          console.log('\nSaved user: ' + users[2].id);
          console.log('\n/*************Strating User Tests**************/\n');
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
  });

  after((done) => {
    userDB.remove({}, () => {
      console.log('\n/******************Finished****************/\n');
      database.close();
      done();
    });
  });

  describe('getUser() =>', () => {
    it('Should return an error if the db given is invalid', (done) => {
      User.getUser(invalidDB, '1234567890')
          .catch((err) => {
            expect(err.output.statusCode).to.be.equal(500);
            expect(err.message).to.be.equal('Trying to access an invalid collection: ' + 'invalid');
            done();
          });
    });

    it('Should return an error if is not given an id', (done) => {
      User.getUser(userDB, '')
        .catch((err) => {
          expect(err.output.statusCode).to.be.equal(400);
          expect(err.message).to.be.equal('Inexistent ID');
          done();
        });
    });

    it('Should return an error if its an inexistent user', (done) => {
      User.getUser(userDB, '123456789')
        .catch((err) => {
          expect(err.output.statusCode).to.be.equal(401);
          expect(err.message).to.be.equal('Inexistent User');
          done();
        });
    });

    it('Should return the user with the given id', (done) => {
      Promise.resolve('1234')
        .then(User.getUser(userDB))
        .then((user) => {
          expect(user.id).to.be.equal(users[0].id);
          expect(user.email).to.be.equal(users[0].email);
          done();
        });
    });
  });

  describe('saveUser() =>', () => {
    it('Should return an error if the db given is invalid', (done) => {
      User.saveUser(invalidDB, {})
        .catch((err) => {
          expect(err.output.statusCode).to.be.equal(500);
          expect(err.message).to.be.equal('Trying to access an invalid collection: ' + 'invalid');
          done();
        });
    });

    it('Should return an error if is not given an valid user', (done) => {
      User.saveUser(userDB, {})
        .catch((err) => {
          expect(err.output.statusCode).to.be.equal(400);
          expect(err.message).to.be.equal('Schema Validation Error');
          done();
        });
    });

    it('Should return the saved user', (done) => {
      User.saveUser(userDB, users[1])
        .then(User.getUser(userDB, '12345'))
        .then((user) => {
          expect(user.id).to.be.equal(users[1].id);
          expect(user.email).to.be.equal(users[1].email);
          expect(user.password).to.be.equal(users[1].password);
          done();
        })
        .catch(done);
    });
  });

  describe('replaceUser() =>', () => {
    it('Should return an error if the db given is invalid', (done) => {
      User.replaceUser(invalidDB, 'id', {})
        .catch((err) => {
          expect(err.output.statusCode).to.be.equal(500);
          expect(err.message).to.be.equal('Trying to access an invalid collection: ' + 'invalid');
          done();
        });
    });

    it('Should return an error if the id given is invalid', (done) => {
      User.replaceUser(userDB, '', {})
        .catch((err) => {
          expect(err.output.statusCode).to.be.equal(400);
          expect(err.message).to.be.equal('Invalid ID');
          done();
        });
    });

    it('Should return an error if is not given an valid user', (done) => {
      User.replaceUser(userDB, '12345', {})
        .catch((err) => {
          expect(err.output.statusCode).to.be.equal(400);
          expect(err.message).to.be.equal('Schema Validation Error');
          done();
        });
    });

    it('Should return the updated/replaced user', (done) => {
      User.replaceUser(userDB, '123456', users[4])
        .then(User.getUser(userDB, '123456'))
        .then((res) => {
          expect(res.ops[0].email).to.be.equal('replacedUser@mail.com');
          expect(res.ops[0].password).to.be.equal('REPLACED');
          done();
        })
        .catch(done);
    });
  });

  describe('addPinnedProject() => ', () => {
    it('Should return an error if the db given is invalid', (done) => {
      User.addPinnedProject(invalidDB, 'id', '')
        .catch((err) => {
          expect(err.output.statusCode).to.be.equal(500);
          expect(err.message).to.be.equal('Trying to access an invalid collection: ' + 'invalid');
          done();
        });
    });

    it('Should return an error if is not given an id', (done) => {
      User.addPinnedProject(userDB, '', '')
        .catch((err) => {
          expect(err.output.statusCode).to.be.equal(400);
          expect(err.message).to.be.equal('Invalid ID');
          done();
        });
    });

    it('Should return an error if its an inexistent user', (done) => {
      User.addPinnedProject(userDB, '123456789', '')
        .catch((err) => {
          expect(err.output.statusCode).to.be.equal(401);
          expect(err.message).to.be.equal('Inexistent User');
          done();
        });
    });

    it('Should return an error if the user have already pinned the project', (done) => {
      User.addPinnedProject(userDB, '1234', '1234')
        .catch((err) => {
          expect(err.output.statusCode).to.be.equal(400);
          expect(err.message).to.be.equal('Project already pinned');
          done();
        });
    });

    it('Should return the project ID if everything was OK', (done) => {
      User.addPinnedProject(userDB, '1234', 'pinned')
        .then((result) => {
          expect(result).to.be.equal('pinned');
          done();
        });
    });
  });

  describe('removePinnedProject() => ', () => {
    it('Should return an error if the db given is invalid', (done) => {
      User.removePinnedProject(invalidDB, 'id', '')
        .catch((err) => {
          expect(err.output.statusCode).to.be.equal(500);
          expect(err.message).to.be.equal('Trying to access an invalid collection: ' + 'invalid');
          done();
        });
    });

    it('Should return an error if is not given an id', (done) => {
      User.removePinnedProject(userDB, '', '')
        .catch((err) => {
          expect(err.output.statusCode).to.be.equal(400);
          expect(err.message).to.be.equal('Invalid ID');
          done();
        });
    });

    it('Should return an error if its an inexistent user', (done) => {
      User.removePinnedProject(userDB, '123456789', '')
        .catch((err) => {
          expect(err.output.statusCode).to.be.equal(401);
          expect(err.message).to.be.equal('Inexistent User');
          done();
        });
    });

    it('Should return an error if the user have already removed the project ID', (done) => {
      User.removePinnedProject(userDB, '1234', '12345')
        .catch((err) => {
          expect(err.output.statusCode).to.be.equal(400);
          expect(err.message).to.be.equal('Project was already removed');
          done();
        });
    });

    it('Should return the project ID if everything was OK', (done) => {
      User.removePinnedProject(userDB, '1234', '1234')
        .then((result) => {
          expect(result).to.be.equal('1234');
          done();
        });
    });
  });

  describe('addLikedProject() => ', () => {
    it('Should return an error if the db given is invalid', (done) => {
      User.addLikedProject(invalidDB, 'id', '')
        .catch((err) => {
          expect(err.output.statusCode).to.be.equal(500);
          expect(err.message).to.be.equal('Trying to access an invalid collection: ' + 'invalid');
          done();
        });
    });

    it('Should return an error if is not given an id', (done) => {
      User.addLikedProject(userDB, '', '')
        .catch((err) => {
          expect(err.output.statusCode).to.be.equal(400);
          expect(err.message).to.be.equal('Invalid ID');
          done();
        });
    });

    it('Should return an error if its an inexistent user', (done) => {
      User.addLikedProject(userDB, '123456789', '')
        .catch((err) => {
          expect(err.output.statusCode).to.be.equal(401);
          expect(err.message).to.be.equal('Inexistent User');
          done();
        });
    });

    it('Should return an error if the user have already liked the project', (done) => {
      User.addLikedProject(userDB, '1234', '1234')
        .catch((err) => {
          expect(err.output.statusCode).to.be.equal(400);
          expect(err.message).to.be.equal('Project already liked');
          done();
        });
    });

    it('Should return the project ID if everything was OK', (done) => {
      User.addLikedProject(userDB, '1234', 'liked')
        .then((result) => {
          expect(result).to.be.equal('liked');
          done();
        });
    });
  });

  describe('removeLikedProject() => ', () => {
    it('Should return an error if the db given is invalid', (done) => {
      User.removeLikedProject(invalidDB, 'id', '')
        .catch((err) => {
          expect(err.output.statusCode).to.be.equal(500);
          expect(err.message).to.be.equal('Trying to access an invalid collection: ' + 'invalid');
          done();
        });
    });

    it('Should return an error if is not given an id', (done) => {
      User.removeLikedProject(userDB, '', '')
        .catch((err) => {
          expect(err.output.statusCode).to.be.equal(400);
          expect(err.message).to.be.equal('Invalid ID');
          done();
        });
    });

    it('Should return an error if its an inexistent user', (done) => {
      User.removeLikedProject(userDB, '123456789', '')
        .catch((err) => {
          expect(err.output.statusCode).to.be.equal(401);
          expect(err.message).to.be.equal('Inexistent User');
          done();
        });
    });

    it('Should return an error if the user have already removed the project ID', (done) => {
      User.removeLikedProject(userDB, '1234', '12345')
        .catch((err) => {
          expect(err.output.statusCode).to.be.equal(400);
          expect(err.message).to.be.equal('Project was already removed');
          done();
        });
    });

    it('Should return the project ID if everything was OK', (done) => {
      User.removeLikedProject(userDB, '1234', '1234')
        .then((result) => {
          expect(result).to.be.equal('1234');
          done();
        }).catch(done);
    });
  });

  describe('UserModel', () => {
    it('Should validate the object with the UserModel defined', (done) => {
      Joi.validate(users[0], UserModel, (err, user) => {
        expect(!!user).to.eql(true);
        done();
      });
    });
  });
});
