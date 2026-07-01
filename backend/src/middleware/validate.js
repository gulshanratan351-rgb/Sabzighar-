import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

// Runs after express-validator chains; throws 400 with first error message.
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const first = errors.array()[0];
    throw new ApiError(400, first.msg);
  }
  next();
};

export default validate;
