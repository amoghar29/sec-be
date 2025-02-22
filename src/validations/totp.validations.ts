import * as Joi from 'joi';

export const addSecretSchema = Joi.object({
  secretKey: Joi.string().required(),
  serviceName: Joi.string().required().min(1).max(100)
});