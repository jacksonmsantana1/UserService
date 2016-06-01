const Boom = require('boom');
const Joi = require('joi');
const curry = require('ramda').curry;
const UserSchema = require('./UserModel.js');

// _getUser :: Collection:db -> String:uid -> Promise(User, Error)
const _getUser = curry((db, uid) => new Promise((resolve, reject) => {
  if (db.collectionName !== 'users') {
    reject(
        Boom.badImplementation('Trying to access an invalid collection: ' + db.collectionName));
  } else if (!uid) {
    reject(Boom.badRequest('Inexistent ID'));
  }

  db.find({ id: uid })
   .each((error, doc) => {
     if (!!doc && doc !== null) {
       resolve(doc);
     } else if (!doc && !error) {
       reject(Boom.unauthorized('Inexistent User'));
     }

     reject(Boom.badRequest('MongoDB Server Error'));
   });
}));

// _saveUser :: Collection:db -> User:user -> Promise(User, Error)
const _saveUser = curry((db, user) =>
  new Promise((resolve, reject) => {
    if (db.collectionName !== 'users') {
      reject(Boom.badImplementation(
        'Trying to access an invalid collection: ' + db.collectionName));
    }

    Joi.validate(user, UserSchema, (err, value) => {
      if (err) {
        reject(Boom.badRequest('Schema Validation Error'));
      }

      db.insert(value)
        .then((res) => resolve(res.ops[0]))
        .catch(() => reject(Boom.badImplementation('MongoDB Server Error')));
    });
  }));

// _replaceUser :: Collection:db -> String:userId -> User:newUser -> Promise(User, Error)
const _replaceUser = curry((db, userId, newUser) =>
  new Promise((resolve, reject) => {
    if (db.collectionName !== 'users') {
      reject(Boom.badImplementation(
        'Trying to access an invalid collection: ' + db.collectionName));
    } else if (!userId) {
      reject(Boom.badRequest('Invalid ID'));
    }

    Joi.validate(newUser, UserSchema, (ValidateErr, value) => {
      if (ValidateErr) {
        reject(Boom.badRequest('Schema Validation Error'));
      }

      db.replaceOne({ id: userId }, value, (mongoErr, user) => {
        if (mongoErr) {
          reject(Boom.badRequest('MongoDB Server Error'));
        }

        resolve(user);
      });
    });
  }));

const _addPinnedProject = curry((db, userId, projectId) =>
  new Promise((resolve, reject) => {
    if (db.collectionName !== 'users') {
      reject(Boom.badImplementation(
        'Trying to access an invalid collection: ' + db.collectionName));
    } else if (!userId) {
      reject(Boom.badRequest('Invalid ID'));
    }

    db.update({ id: userId },
      { $addToSet: { 'projects.pinned': projectId } })
      .then((writeResult) => {
        if (!writeResult.result.n) {
          reject(Boom.unauthorized('Inexistent User'));
        } else if (!writeResult.result.nModified && !!writeResult.result.n) {
          reject(Boom.badRequest('Project already pinned'));
        } else if (!!writeResult.result.nModified && !!writeResult.result.n) {
          resolve(projectId);
        } else if (!writeResult.ok) {
          reject(Boom.badImplementation('MongoDB Server Error'));
        }
      });
  }));

const _addLikedProject = curry((db, userId, projectId) =>
  new Promise((resolve, reject) => {
    if (db.collectionName !== 'users') {
      reject(Boom.badImplementation(
        'Trying to access an invalid collection: ' + db.collectionName));
    } else if (!userId) {
      reject(Boom.badRequest('Invalid ID'));
    }

    db.update({ id: userId },
      { $addToSet: { 'projects.liked': projectId } })
      .then((writeResult) => {
        if (!writeResult.result.n) {
          reject(Boom.unauthorized('Inexistent User'));
        } else if (!writeResult.result.nModified && !!writeResult.result.n) {
          reject(Boom.badRequest('Project already liked'));
        } else if (!!writeResult.result.nModified && !!writeResult.result.n) {
          resolve(projectId);
        } else if (!writeResult.ok) {
          reject(Boom.badImplementation('MongoDB Server Error'));
        }
      });
  }));

const _removePinnedProject = curry((db, userId, projectId) =>
  new Promise((resolve, reject) => {
    if (db.collectionName !== 'users') {
      reject(Boom.badImplementation(
        'Trying to access an invalid collection: ' + db.collectionName));
    } else if (!userId) {
      reject(Boom.badRequest('Invalid ID'));
    }

    db.update({ id: userId },
      { $pull: { 'projects.pinned': projectId } })
      .then((writeResult) => {
        if (!writeResult.result.n) {
          reject(Boom.unauthorized('Inexistent User'));
        } else if (!writeResult.result.nModified && !!writeResult.result.n) {
          reject(Boom.badRequest('Project was already removed'));
        } else if (!!writeResult.result.nModified && !!writeResult.result.n) {
          resolve(projectId);
        } else if (!writeResult.ok) {
          reject(Boom.badImplementation('MongoDB Server Error'));
        }
      });
  }));

module.exports = {
  getUser: _getUser,
  saveUser: _saveUser,
  replaceUser: _replaceUser,
  addPinnedProject: _addPinnedProject,
  removePinnedProject: _removePinnedProject,
  addLikedProject: _addLikedProject,
};
