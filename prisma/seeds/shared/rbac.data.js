const systemRoles = [
  { code: 'admin', name: 'Administrator', description: 'Full system access' },
  { code: 'manager', name: 'Manager', description: 'Department and assignment management' },
  { code: 'trainer', name: 'Trainer', description: 'Course and quiz authoring' },
  { code: 'employee', name: 'Employee', description: 'Learner access' },
];

const basePermissions = [
  ['course.create', 'course', 'create', 'Create courses'],
  ['course.read', 'course', 'read', 'Read course data'],
  ['course.update', 'course', 'update', 'Update course data'],
  ['course.publish', 'course', 'publish', 'Publish courses'],
  ['course.delete', 'course', 'delete', 'Delete courses'],
  ['roadmap.read', 'roadmap', 'read', 'Read roadmaps'],
  ['roadmap.create', 'roadmap', 'create', 'Create roadmaps'],
  ['roadmap.update', 'roadmap', 'update', 'Update roadmaps'],
  ['roadmap.delete', 'roadmap', 'delete', 'Delete roadmaps'],
  ['roadmap.assign', 'roadmap', 'assign', 'Assign roadmaps'],
  ['quiz.read', 'quiz', 'read', 'Read quizzes'],
  ['quiz.create', 'quiz', 'create', 'Create quizzes'],
  ['quiz.update', 'quiz', 'update', 'Update quizzes'],
  ['quiz.delete', 'quiz', 'delete', 'Delete quizzes'],
  ['quiz.grade', 'quiz', 'grade', 'Grade quiz attempts'],
  ['user.read', 'user', 'read', 'Read user profiles'],
  ['user.assign_role', 'user', 'assign_role', 'Assign user roles'],
];

const rolePermissionCodes = {
  admin: basePermissions.map(([code]) => code),
  manager: [
    'course.read',
    'roadmap.read',
    'roadmap.create',
    'roadmap.update',
    'roadmap.delete',
    'roadmap.assign',
    'user.read',
  ],
  trainer: [
    'course.create',
    'course.read',
    'course.update',
    'course.publish',
    'quiz.read',
    'quiz.create',
    'quiz.update',
    'quiz.delete',
    'quiz.grade',
  ],
  employee: ['course.read', 'roadmap.read', 'quiz.read', 'user.read'],
};

module.exports = {
  systemRoles,
  basePermissions,
  rolePermissionCodes,
};
