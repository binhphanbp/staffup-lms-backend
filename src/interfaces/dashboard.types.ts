export interface DashboardStats {
  users: {
    total: number;
    active: number;
    inactive: number;
    byRole: {
      admin: number;
      trainer: number;
      student: number;
    };
  };
  courses: {
    total: number;
    published: number;
    draft: number;
    archived: number;
  };
  enrollments: {
    total: number;
    assigned: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    expired: number;
    completionRate: number; // percentage
  };
  riskSummary: {
    total: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface ManagerDashboardStats {
  learners: {
    total: number;
    active: number;
    inactive: number;
  };
  overdue: {
    total: number;
    enrollments: Array<{
      userId: bigint;
      userName: string;
      courseId: bigint;
      courseTitle: string;
      dueAt: Date;
      daysOverdue: number;
    }>;
  };
  roadmapCompletion: {
    totalAssignments: number;
    completed: number;
    inProgress: number;
    assigned: number;
    completionRate: number;
  };
  risks: {
    total: number;
    high: number;
    medium: number;
    low: number;
    learners: Array<{
      enrollmentId: string;
      userId: bigint;
      userName: string;
      riskLevel: string;
      riskScore: number;
      courseTitle: string;
      /** AI-generated risk factor explanations (Vietnamese) */
      reasons: unknown | null;
      /** AI-generated intervention recommendations (Vietnamese) */
      interventions: unknown | null;
      /** When the risk score was last calculated */
      calculatedAt: Date | null;
    }>;
  };
}

export interface TrainerDashboardStats {
  courses: {
    total: number;
    published: number;
    draft: number;
    archived: number;
  };
  pendingGrading: {
    total: number;
    quizAttempts: Array<{
      attemptId: bigint;
      studentId: bigint;
      studentName: string;
      courseId: bigint;
      courseTitle: string;
      quizTitle: string;
      submittedAt: Date;
      daysWaiting: number;
    }>;
  };
  enrollments: {
    total: number;
    assigned: number;
    inProgress: number;
    completed: number;
    averageProgress: number;
  };
  passRate: {
    totalAttempts: number;
    passed: number;
    failed: number;
    passPercentage: number;
  };
}

export interface EmployeeDashboardStats {
  myCourses: {
    total: number;
    assigned: number;
    inProgress: number;
    completed: number;
    courses: Array<{
      enrollmentId: bigint;
      courseId: bigint;
      courseTitle: string;
      courseThumbnail: string | null;
      status: string;
      progress: number;
      dueAt: Date | null;
      enrolledAt: Date;
      completedAt: Date | null;
    }>;
  };
  myRoadmaps: {
    total: number;
    assigned: number;
    inProgress: number;
    completed: number;
    roadmaps: Array<{
      assignmentId: bigint;
      roadmapId: bigint;
      roadmapTitle: string;
      targetPosition: string | null;
      status: string;
      totalCourses: number;
      completedCourses: number;
      progressPercent: number;
      assignedAt: Date;
      completedAt: Date | null;
    }>;
  };
  progressSummary: {
    totalTimeSpentMinutes: number;
    completedLessons: number;
    averageProgress: number;
    recentActivity: Date | null;
    upcomingDeadlines: Array<{
      courseId: bigint;
      courseTitle: string;
      dueAt: Date;
      daysRemaining: number;
      currentProgress: number;
    }>;
  };
  certificates: {
    total: number;
    certificates: Array<{
      certificateId: bigint;
      certificateCode: string;
      courseId: bigint;
      courseTitle: string;
      issuedAt: Date;
      pdfUrl: string | null;
    }>;
  };
}
