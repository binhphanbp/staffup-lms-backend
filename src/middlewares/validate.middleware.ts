import type { Request, Response, NextFunction } from 'express';
import { type ZodSchema, ZodError } from 'zod';

type ValidationTarget = 'body' | 'query' | 'params' | 'all';

const targetLabels: Record<ValidationTarget, string> = {
  body: 'request body',
  query: 'query parameters',
  params: 'path parameters',
  all: 'request payload',
};

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
      const dataToValidate =
        target === 'all'
          ? {
              body: req.body,
              query: req.query,
              params: req.params,
            }
          : req[target];

      const parsed = schema.parse(dataToValidate);

      if (target === 'all') {
        const parsedAll = parsed as {
          body?: unknown;
          query?: Record<string, unknown>;
          params?: Record<string, unknown>;
        };

        if (parsedAll.body !== undefined) {
          req.body = parsedAll.body;
        }

        if (parsedAll.query !== undefined) {
          const currentQuery = req.query as Record<string, unknown>;

          for (const key of Object.keys(currentQuery)) {
            delete currentQuery[key];
          }

          Object.assign(currentQuery, parsedAll.query);
        }

        if (parsedAll.params !== undefined) {
          const currentParams = req.params as Record<string, unknown>;

          for (const key of Object.keys(currentParams)) {
            delete currentParams[key];
          }

          Object.assign(currentParams, parsedAll.params);
        }
      } else if (target === 'body') {
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
          field: err.path.length > 0 ? err.path.join('.') : target,
          message: err.message.endsWith('.') ? err.message : `${err.message}.`,
        }));

        res.status(400).json({
          success: false,
          status: 'fail',
          message: `Invalid ${targetLabels[target]}.`,
          errors: formattedErrors,
        });
        return;
      }
      next(error);
    }
  };
};
