const Joi = require('joi');

module.exports = Joi.object().keys({
  _id: Joi.any().optional(),
  id: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().required(),
  password: Joi.string(),
  projects: Joi.object({
    pinned: Joi.array(),
    liked: Joi.array(),
    doneProjects: Joi.array(),
    inProgressProjects: Joi.array(),
  }),
});
