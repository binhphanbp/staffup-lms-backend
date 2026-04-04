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
      let dataToValidate: any;

      if (target === 'all') {
        // For schemas with nested structure like { params: {...}, query: {...}, body: {...} }
        dataToValidate = {
          body: req.body,
          query: req.query,
          params: req.params,
        };
      } else {
        // For simple schemas that validate a single part
        dataToValidate = req[target];
      }

      const parsed = schema.parse(dataToValidate);

      if (target === 'all') {
        const parsedAll = parsed as any;
        // Only update body and params (query is read-only in Express)
        if (parsedAll.body !== undefined) {
          req.body = parsedAll.body;
        }
        if (parsedAll.params !== undefined) {
          req.params = parsedAll.params;
        }
        // Query is validated but not reassigned (read-only)
      } else {
        req[target] = parsed;
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
