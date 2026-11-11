import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';

type ValidationLocation = 'body' | 'query' | 'params';

export const validate = (
  schema: ZodType,
  location: ValidationLocation = 'body'
): RequestHandler => {
  return async (req, res, next) => {
    const data =
      location === 'body' ? req.body : location === 'query' ? req.query : req.params;

    const validatedData = await schema.parseAsync(data);

    req.validated ??= {};
    req.validated[location] = validatedData;

    next();
  };
};
