import { Router, type Router as ExpressRouter } from 'express';
import {
  addCourseToRoadmap,
  assignRoadmapToUsers,
  createRoadmap,
  deleteRoadmap,
  getRoadmapById,
  listRoadmapAssignments,
  listRoadmaps,
  removeCourseFromRoadmap,
  reorderRoadmapCourses,
  updateRoadmap,
  updateRoadmapCourse,
} from '@/controllers/roadmap.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validate.middleware';
import {
  addCourseToRoadmapSchema,
  assignRoadmapToUsersSchema,
  createRoadmapSchema,
  listRoadmapAssignmentsQuerySchema,
  listRoadmapsQuerySchema,
  reorderRoadmapCoursesSchema,
  roadmapCourseParamsSchema,
  roadmapIdOnlyParamsSchema,
  roadmapIdParamsSchema,
  updateRoadmapCourseSchema,
  updateRoadmapSchema,
} from '@/schemas/roadmap.schema';

const router: ExpressRouter = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route GET /api/v1/roadmaps/assignments
 * @desc List roadmap assignments with filters
 * @access Private
 */
router.get(
  '/assignments',
  validate(listRoadmapAssignmentsQuerySchema, 'query'),
  listRoadmapAssignments,
);

/**
 * @route GET /api/v1/roadmaps
 * @desc List roadmaps with filters
 * @access Private
 */
router.get('/', validate(listRoadmapsQuerySchema, 'query'), listRoadmaps);

/**
 * @route POST /api/v1/roadmaps
 * @desc Create roadmap
 * @access Private (Admin/Department Manager)
 */
router.post('/', validate(createRoadmapSchema), createRoadmap);

/**
 * @route GET /api/v1/roadmaps/:id
 * @desc Get roadmap detail
 * @access Private
 */
router.get('/:id', validate(roadmapIdParamsSchema, 'params'), getRoadmapById);

/**
 * @route PUT /api/v1/roadmaps/:id
 * @desc Update roadmap
 * @access Private (Admin/Department Manager)
 */
router.put(
  '/:id',
  validate(roadmapIdParamsSchema, 'params'),
  validate(updateRoadmapSchema),
  updateRoadmap,
);

/**
 * @route DELETE /api/v1/roadmaps/:id
 * @desc Delete roadmap
 * @access Private (Admin/Department Manager)
 */
router.delete('/:id', validate(roadmapIdParamsSchema, 'params'), deleteRoadmap);

/**
 * @route POST /api/v1/roadmaps/:roadmapId/courses
 * @desc Add course to roadmap
 * @access Private (Admin/Department Manager)
 */
router.post(
  '/:roadmapId/courses',
  validate(roadmapIdOnlyParamsSchema, 'params'),
  validate(addCourseToRoadmapSchema),
  addCourseToRoadmap,
);

/**
 * @route DELETE /api/v1/roadmaps/:roadmapId/courses/:courseId
 * @desc Remove course from roadmap
 * @access Private (Admin/Department Manager)
 */
router.delete(
  '/:roadmapId/courses/:courseId',
  validate(roadmapCourseParamsSchema, 'params'),
  removeCourseFromRoadmap,
);

/**
 * @route PUT /api/v1/roadmaps/:roadmapId/courses/:courseId
 * @desc Update roadmap course settings (order, isRequired)
 * @access Private (Admin/Department Manager)
 */
router.put(
  '/:roadmapId/courses/:courseId',
  validate(roadmapCourseParamsSchema, 'params'),
  validate(updateRoadmapCourseSchema),
  updateRoadmapCourse,
);

/**
 * @route POST /api/v1/roadmaps/:roadmapId/courses/reorder
 * @desc Reorder roadmap courses
 * @access Private (Admin/Department Manager)
 */
router.post(
  '/:roadmapId/courses/reorder',
  validate(roadmapIdOnlyParamsSchema, 'params'),
  validate(reorderRoadmapCoursesSchema),
  reorderRoadmapCourses,
);

/**
 * @route POST /api/v1/roadmaps/:roadmapId/assign
 * @desc Assign roadmap to users
 * @access Private (Admin/Department Manager)
 */
router.post(
  '/:roadmapId/assign',
  validate(roadmapIdOnlyParamsSchema, 'params'),
  validate(assignRoadmapToUsersSchema),
  assignRoadmapToUsers,
);

export default router;
