// Interface for roadmap detail response
export interface RoadmapDetailResponse {
  id: string;
  title: string;
  description: string | null;
  targetPosition: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Department info
  department: {
    id: string;
    name: string;
  };

  // Category info
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;

  // Creator info
  createdBy: {
    id: string;
    fullName: string;
    email: string;
  } | null;

  // List courses in roadmap
  courses: Array<{
    id: string;
    title: string;
    slug: string;
    description: string | null;
    thumbnailUrl: string | null;
    status: string;
    estimatedDurationMinutes: number | null;
    orderIndex: number;
    isRequired: boolean;

    // Trainer info
    trainer: {
      id: string;
      fullName: string;
      avatarUrl: string | null;
    };

    // Stats
    stats: {
      totalModules: number;
      totalLessons: number;
      totalEnrollments: number;
    };

    // User enrollment info
    userEnrollment?: {
      enrollmentId: string;
      status: string;
      progressPercent: number;
      completedLessonsCount: number;
      enrolledAt: string;
      startedAt: string | null;
      completedAt: string | null;
    };
  }>;

  // Assignment info
  userAssignment: {
    assignmentId: string;
    status: string; // assigned, in_progress, completed, dropped
    assignedAt: string;
    startedAt: string | null;
    completedAt: string | null;
    droppedAt: string | null;
    assignedBy: {
      id: string;
      fullName: string;
    } | null;
  } | null;
  stats: {
    totalCourses: number;
    requiredCourses: number;
    optionalCourses: number;
    totalEstimatedMinutes: number;
    totalAssignments: number;
  };
}
