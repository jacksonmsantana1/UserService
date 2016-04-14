const Lab = require('lab');
const lab = exports.lab = Lab.script();
const expect = require('chai').expect;
const Jwt = require('jsonwebtoken');

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://127.0.0.1:27017/test';

const User = require('../app/User/User.js');
const users = require('./usersMock.js');

const describe = lab.describe;
const it = lab.it;
const before = lab.before;
const after = lab.after;

const server = require('../server.js');

describe('User', () => {
  let privateKey = 'dsakf34CONOUNAclOCUICObl3292weas34gbsLJ32f';

  let tokenHeader = (userId, options) => {
    options = options || {};

    return 'Bearer ' + Jwt.sign({ id: userId }, privateKey, options);
  };

  let invalidTokenHeader = (userId, options) => {
    options = options || {};

    return 'Bearer ' + Jwt.sign({ anus: userId }, privateKey, options);
  };

  let invalidTokenKey = (userId, options) => {
    options = options || {};

    return 'Bearer ' + Jwt.sign({ id: userId }, 'invalid private key', options);
  };

  let userDB;
  let database;

  before((done) => {
    MongoClient.connect(url, (err, db) => {
      if (err) {
        done(err);
      }

      console.log('Connected...');
      database = db;
      userDB = database.collection('users');

      User.saveUser(userDB, users[1])
        .then((user) => {
          console.log('=>=>=> Saved user: ' + user.id);
          console.log('\n/*************Starting Handlers Tests**************/\n');
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

  describe('/user/{id}', () => {

    it('Should return an error if the request doesnt contain a token', (done) => {
      let options = {
        method: 'GET',
        url: '/user/invalidId'
      };

      server.inject(options, (response) => {

        expect(response.statusCode).to.be.equal(401);
        expect(JSON.parse(response.payload).message).to.be.equal('Missing authentication');
        done();
      });
    });

    it('Should return an error if the token isnt valid', (done) => {
      let options = {
        method: 'GET',
        url: '/user/1234567890',
        headers: {
          authorization: invalidTokenKey('1234567890')
        }
      };
      let strError = 'Invalid signature received for JSON Web Token validation';

      server.inject(options, (response) => {
        expect(response.statusCode).to.be.equal(401);
        expect(response.result.message).to.be.equal(strError);
        done();
      });
    });

    it('Should return an error if the token doesnt contain the id value', (done) => {
      let options = {
        method: 'GET',
        url: '/user/invalidId',
        headers: {
          authorization: invalidTokenHeader('123456789')
        }
      };

      server.inject(options, (response) => {

        expect(response.statusCode).to.be.equal(400);
        expect(JSON.parse(response.payload).message)
          .to.be.equal('Invalid Token - ID value doesnt exist');
        done();
      });
    });

    it('Should return an error if the token`s ID doesnt match with the url`s id', (done) => {
      let options = {
        method: 'GET',
        url: '/user/123456789',
        headers: {
          authorization: tokenHeader('1234567890')
        }
      };

      server.inject(options, (response) => {

        expect(response.statusCode).to.be.equal(401);
        expect(JSON.parse(response.payload).message).to.be.equal('Invalid ID: 123456789');
        done();
      });
    });

    it('Should return an error if the user with the given id doesnt exist', (done) => {
      let options = {
        method: 'GET',
        url: '/user/1234',
        headers: {
          authorization: tokenHeader('1234')
        }
      };

      server.inject(options, (response) => {
        expect(response.statusCode).to.be.equal(400);
        expect(JSON.parse(response.payload).message).to.be.equal('Inexistent User');
        done();
      });
    });

    it('Should return the user object, also include token, without the password', (done) => {
      let options = {
        method: 'GET',
        url: '/user/12345',
        headers: {
          authorization: tokenHeader('12345'),
        },
      };

      server.inject(options, (response) => {
        let user = response.result;

        expect(response.statusCode).to.be.equal(200);
        expect(!!response.headers.authorization).to.be.equal(true);
        expect(user.id).to.be.equal('12345');
        expect(user.password).to.be.equal(undefined);
        done();
      });
    });
  });

  describe('/user/projects', () => {

    it('Should be listening to this endpoint', (done) => {
      let options = {
        method: 'GET',
        url: '/user/projects',
        headers: {
          authorization: tokenHeader('1234567890')
        }
      };

      server.inject(options, (response) => {
        let res = response.raw.req;

        expect(res.method).to.be.equal('GET');
        expect(res.url).to.be.equal('/user/projects');
        done();
      });
    });

    it('Should return an error if the request doesnt contain a token', (done) => {
      let options = {
        method: 'GET',
        url: '/user/projects'
      };

      server.inject(options, (response) => {
        expect(response.statusCode).to.be.equal(401);
        expect(response.result.message).to.be.equal('Missing authentication');
        done();
      });
    });

    it('Should return an error if token isn t valid', (done) => {
      let options = {
        method: 'GET',
        url: '/user/projects',
        headers: {
          authorization: invalidTokenKey('1234567890')
        }
      };
      let strError = 'Invalid signature received for JSON Web Token validation';

      server.inject(options, (response) => {
        expect(response.statusCode).to.be.equal(401);
        expect(response.result.message).to.be.equal(strError);
        done();
      });
    });

    it('Should return an error if token request doesnt contain id s value', (done) => {
      let options = {
        method: 'GET',
        url: '/user/projects',
        headers: {
          authorization: invalidTokenHeader('1234567890')
        }
      };

      server.inject(options, (response) => {
        expect(response.statusCode).to.be.equal(400);
        expect(response.result.message).to.be.equal('Invalid Token - ID value doesnt exist');
        done();
      });
    });

    it('Should return an error if the user doenst exists', (done) => {
      let options = {
        method: 'GET',
        url: '/user/projects',
        headers: {
          authorization: tokenHeader('123456789')
        }
      };
      let strError = 'Inexistent User';

      server.inject(options, (response) => {
        expect(response.statusCode).to.be.equal(400);
        expect(response.result.message).to.be.equal(strError);
        done();
      });
    });

    it('Should return the user s project object', (done) => {
      let options = {
        method: 'GET',
        url: '/user/projects',
        headers: {
          authorization: tokenHeader('12345')
        }
      };

      server.inject(options, (response) => {
        const projects = response.result;

        expect(response.statusCode).to.be.equal(200);
        expect(!!response.headers.authorization).to.be.equal(true);
        expect(projects.pinned).to.be.an('array');
        expect(projects.liked).to.be.an('array');
        expect(projects.doneProjects).to.be.an('array');
        expect(projects.inProgressProjects).to.be.an('array');
        done();
      });
    });
  });

  describe('/user/projects/pinned', () => {

    it('Should return an error if it s missing authentication', (done) => {
      let options = {
        method: 'POST',
        url: '/user/projects/pinned'
      };

      server.inject(options, (response) => {
        expect(response.statusCode).to.be.equal(401);
        expect(response.result.message).to.be.equal('Missing authentication');
        done();
      });
    });

    it('Should return an error if the token doesn t contain the id value', (done) => {
      let options = {
        method: 'POST',
        url: '/user/projects/pinned',
        headers: {
          authorization: invalidTokenHeader('123456789')
        }
      };

      server.inject(options, (response) => {

        expect(response.statusCode).to.be.equal(400);
        expect(JSON.parse(response.payload).message)
          .to.be.equal('Invalid Token - ID value doesnt exist');
        done();
      });
    });

    it('Should return an error if token isn t valid', (done) => {
      let options = {
        method: 'POST',
        url: '/user/projects/pinned',
        headers: {
          authorization: invalidTokenKey('1234567890')
        }
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
        method: 'POST',
        url: '/user/projects/pinned',
        headers: {
          authorization: tokenHeader('123456789')
        },
        payload: {
          projectId: '123456'
        }
      };
      let strError = 'Inexistent User';

      server.inject(options, (response) => {
        expect(response.statusCode).to.be.equal(400);
        expect(response.result.message).to.be.equal(strError);
        done();
      });
    });

    it('Should be listening for a POST request to this endpoint', (done) => {
      let options = {
        method: 'POST',
        url: '/user/projects/pinned',
        headers: {
          authorization: tokenHeader('1234567890')
        },
        payload: {
          projectId: '123456'
        }
      };

      server.inject(options, (response) => {
        let res = response.raw.req;

        expect(res.method).to.be.equal('POST');
        expect(res.url).to.be.equal('/user/projects/pinned');
        done();
      });
    });

    it('Should contain in the request the Project s ID', (done) => {
      let options = {
        method: 'POST',
        url: '/user/projects/pinned',
        headers: {
          authorization: tokenHeader('1234567890')
        },
        payload: {}
      };

      server.inject(options, (response) => {
        expect(response.statusCode).to.be.equal(400);
        expect(response.result.message).to.be.equal('Missing the Project s ID');
        done();
      });
    });

    it('Should return an error if the project is already pinned by the user', (done) => {
      let options = {
        method: 'POST',
        url: '/user/projects/pinned',
        headers: {
          authorization: tokenHeader('12345')
        },
        payload: {
          projectId: '12345'
        }
      };

      server.inject(options, (response) => {
        expect(response.statusCode).to.be.equal(400);
        expect(response.result.message).to.be.equal('Project already pinned');
        done();
      });
    });

    it('Should return an error if the project don t exist', (done) => {
      let options = {
        method: 'POST',
        url: '/user/projects/pinned',
        headers: {
          authorization: tokenHeader('1234567890')
        },
        payload: {
          projectId: 'DONT EXIST'
        }
      };

      server.inject(options, (response) => {
        expect(response.statusCode).to.be.equal(400);
        expect(response.result.message).to.be.equal('Project doesn t exist');
        done();
      });
    });

    it('Should update the user with the new pinned project and return it with a n authorization header', (done) => {
      let options = {
        method: 'POST',
        url: '/user/projects/pinned',
        headers: {
          authorization: tokenHeader('12345')
        },
        payload: {
          projectId: '123456'
        }
      };

      server.inject(options, (response) => {
        expect(response.statusCode).to.be.equal(200);
        expect(!!response.headers.authorization).to.be.equal(true);
        expect(response.result).to.be.equal('123456');
        done();
      });
    });
  });

  describe('/user/projects/desPinned', () => {
    it('Should be listenning to this endpoint', (done) => {
      let options = {
        method: 'PUT',
        url: '/user/projects/desPinned',
        headers: {
          authorization: tokenHeader('12345')
        },
        payload: {
          projectId: '1234567890'
        }
      };

      server.inject(options, (response) => {
        let res = response.raw.req;

        expect(res.method).to.be.equal('PUT');
        expect(res.url).to.be.equal('/user/projects/desPinned');
        done();
      });
    });

    it('Should return an error if it s missing authentication', (done) => {
      let options = {
        method: 'PUT',
        url: '/user/projects/desPinned'
      };

      server.inject(options, (response) => {
        expect(response.statusCode).to.be.equal(401);
        expect(response.result.message).to.be.equal('Missing authentication');
        done();
      });
    });

    it('Should return an error if the token doesn t contain the id value', (done) => {
      let options = {
        method: 'PUT',
        url: '/user/projects/desPinned',
        headers: {
          authorization: invalidTokenHeader('12345')
        }
      };

      server.inject(options, (response) => {
        expect(response.statusCode).to.be.equal(400);
        expect(JSON.parse(response.payload).message)
          .to.be.equal('Invalid Token - ID value doesnt exist');
        done();
      });
    });

    it('Should return an error if token isn t valid', (done) => {
      let options = {
        method: 'PUT',
        url: '/user/projects/desPinned',
        headers: {
          authorization: invalidTokenKey('12345')
        }
      };
      let strError = 'Invalid signature received for JSON Web Token validation';

      server.inject(options, (response) => {
        expect(response.statusCode).to.be.equal(401);
        expect(response.result.message).to.be.equal(strError);
        done();
      });
    });

    it('Should contain in the request the Project s ID', (done) => {
      let options = {
        method: 'PUT',
        url: '/user/projects/desPinned',
        headers: {
          authorization: tokenHeader('12345')
        },
        payload: {}
      };

      server.inject(options, (response) => {
        expect(response.statusCode).to.be.equal(400);
        expect(response.result.message).to.be.equal('Missing the Project s ID');
        done();
      });
    });

    it('Should return an error if the project don t exist', (done) => {
      let options = {
        method: 'PUT',
        url: '/user/projects/desPinned',
        headers: {
          authorization: tokenHeader('12345')
        },
        payload: {
          projectId: 'DONT EXIST'
        }
      };

      server.inject(options, (response) => {
        expect(response.statusCode).to.be.equal(400);
        expect(response.result.message).to.be.equal('Project doesn t exist');
        done();
      });
    });

    it('Should return an error if the user`s id doenst exists', (done) => {
      let options = {
        method: 'PUT',
        url: '/user/projects/desPinned',
        headers: {
          authorization: tokenHeader('123456789')
        },
        payload: {
          projectId: '12345'
        }
      };
      let strError = 'Inexistent User';

      server.inject(options, (response) => {
        expect(response.statusCode).to.be.equal(400);
        expect(response.result.message).to.be.equal(strError);
        done();
      });
    });

    it('Should return an error if the project isnt pinned', (done) => {
      let options = {
        method: 'PUT',
        url: '/user/projects/desPinned',
        headers: {
          authorization: tokenHeader('12345'),
        },
        payload: {
          projectId: '1234567890',
        },
      };
      let strError = 'Can t despin this project';

      server.inject(options, (response) => {
        expect(response.statusCode).to.be.equal(400);
        expect(response.result.message).to.be.equal(strError);
        done();
      });
    });

    it('Should return an authorization header after updating the user s content', (done) => {
      let options = {
        method: 'PUT',
        url: '/user/projects/desPinned',
        headers: {
          authorization: tokenHeader('12345')
        },
        payload: {
          projectId: '12345'
        }
      };

      server.inject(options, (response) => {
        expect(response.statusCode).to.be.equal(200);
        expect(!!response.headers.authorization).to.be.equal(true);
        done();
      });
    });
  });
});

