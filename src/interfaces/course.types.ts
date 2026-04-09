export type CourseExpand = 'modules' | 'lessons' | 'resources' | 'quiz' | 'tags' | 'all';

export interface CourseDetailResponse {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnailUrl: string | null;
  status: string;
  estimatedDurationMinutes: number | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;

  trainer: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl: string | null;
  };

  category: {
    id: string;
    name: string;
    slug: string;
  } | null;

  ownerDepartment: {
    id: string;
    name: string;
  } | null;

  tags?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;

  modules?: Array<{
    id: string;
    title: string;
    orderIndex: number;
    lessons: Array<{
      id: string;
      title: string;
      lessonType: string;
      durationSeconds: number;
      orderIndex: number;
      isPreview: boolean;
      videoUrl: string | null;
      contentText: string | null;
      resources: Array<{
        id: string;
        fileName: string;
        fileUrl: string;
        resourceType: string | null;
        orderIndex: number;
      }>;
      quiz?: {
        id: string;
        title: string;
        description: string | null;
        totalQuestions: number;
        passScorePercent: number;
        timeLimitMinutes: number | null;
        maxAttempts: number | null;
        shuffleQuestions: boolean;
        shuffleOptions: boolean;
      };
    }>;
  }>;

  stats?: {
    totalModules: number;
    totalLessons: number;
    totalDurationMinutes: number;
    totalEnrollments: number;
  };
}
