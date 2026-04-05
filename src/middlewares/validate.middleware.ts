import type { Request, Response, NextFunction } from 'express';
import { type ZodSchema, ZodError } from 'zod';

type ValidationTarget = 'body' | 'query' | 'params' | 'all';

/**
 * Generic Zod validation middleware.
 *
 * @param schema - Zod schema to validate against
 * @param target - Which part of the request to validate (body, query, params, or all)
 *
 * @example
 * router.post('/courses', validate(createCourseSchema, 'body'), createCourse);
 * router.get('/courses/:id', validate(courseIdParamSchema, 'params'), getCourse);
 * router.get('/enrollments/:id/detail', validate(getEnrollmentDetailSchema, 'all'), getDetail);
 */
export const validate = (schema: ZodSchema, target: ValidationTarget = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[target]);

      if (target === 'body') {
        req.body = parsed;
      } else {
        const currentTarget = req[target] as Record<string, unknown>;

        for (const key of Object.keys(currentTarget)) {
          delete currentTarget[key];
        }

        Object.assign(currentTarget, parsed);
      }

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
