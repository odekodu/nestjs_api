import * as Joi from 'joi';
import { ListValidator } from '../../../shared/list.validator';

export const ListCartItemsValidator = Joi.object({
  ...ListValidator
});
