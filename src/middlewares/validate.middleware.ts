import type { Request, Response, NextFunction } from 'express';
import { type ZodSchema, ZodError } from 'zod';

type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Generic Zod validation middleware.
 *
 * @param schema - Zod schema to validate against
 * @param target - Which part of the request to validate (body, query, or params)
 *
 * @example
 * router.post('/courses', validate(createCourseSchema, 'body'), createCourse);
 */
export const validate = (schema: ZodSchema, target: ValidationTarget = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[target]);
      req[target] = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          success: false,
          status: 'fail',
          message: 'Validation failed',
          errors: formattedErrors,
        });
        return;
      }
      next(error);
    }
  };
};
