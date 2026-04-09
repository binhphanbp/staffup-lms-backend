export interface EnrollmentDetailResponse {
  id: string;
  userId: string;
  courseId: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'expired';
  enrolledAt: string;
  startedAt: string | null;
  completedAt: string | null;
  lastActivityAt: string | null;
  dueAt: string | null;

  // Course info
  course: {
    id: string;
    title: string;
    slug: string;
    description: string;
    thumbnailUrl: string | null;
    estimatedDurationMinutes: number;
    trainer: {
      id: string;
      fullName: string;
      email: string;
      avatarUrl: string | null;
    };
  };

  // Progress summary
  progressSummary: {
    progressPercent: number;
    completedLessonsCount: number;
    totalLessonsCount: number;
    timeSpentSeconds: number;
    timeSpentFormatted: string;
    lastAccessedLesson: {
      id: string;
      title: string;
      moduleTitle: string;
      lastAccessedAt: string;
    } | null;
    quizProgress: {
      totalQuizzes: number;
      completedQuizzes: number;
      passedQuizzes: number;
      averageScore: number | null;
    };
  };

  // Certificate state
  certificate: {
    isEligible: boolean;
    isIssued: boolean;
    certificateId: string | null;
    certificateCode: string | null;
    issuedAt: string | null;
    pdfUrl: string | null;
    isRevoked: boolean;
    revokedAt: string | null;
    requirements: {
      minProgressPercent: number;
      currentProgressPercent: number;
      minTimeSpentMinutes: number;
      currentTimeSpentMinutes: number;
      allLessonsCompleted: boolean;
      allQuizzesPassed: boolean;
    };
  };

  // Assignment info
  assignment: {
    assignedBy: {
      id: string;
      fullName: string;
      email: string;
    } | null;
    assignmentNote: string | null;
    dueAt: string | null;
    isOverdue: boolean;
  };

  // Risk assessment (if available)
  riskAssessment: {
    riskScore: number;
    riskLevel: 'low' | 'medium' | 'high';
    reasons: any;
    recommendations: string | null;
    calculatedAt: string;
  } | null;
}
