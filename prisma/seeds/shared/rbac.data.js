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
  ['roadmap.create', 'roadmap', 'create', 'Create roadmaps'],
  ['roadmap.assign', 'roadmap', 'assign', 'Assign roadmaps'],
  ['quiz.create', 'quiz', 'create', 'Create quizzes'],
  ['quiz.grade', 'quiz', 'grade', 'Grade quiz attempts'],
  ['user.read', 'user', 'read', 'Read user profiles'],
  ['user.assign_role', 'user', 'assign_role', 'Assign user roles'],
];

const rolePermissionCodes = {
  admin: basePermissions.map(([code]) => code),
  manager: ['course.read', 'roadmap.create', 'roadmap.assign', 'user.read'],
  trainer: [
    'course.create',
    'course.read',
    'course.update',
    'course.publish',
    'quiz.create',
    'quiz.grade',
  ],
  employee: ['course.read', 'user.read'],
};

module.exports = {
  systemRoles,
  basePermissions,
  rolePermissionCodes,
};
