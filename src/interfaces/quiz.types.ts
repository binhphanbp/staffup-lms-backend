// Quiz Attempt Detail Response Types

export interface QuizAttemptDetailResponse {
  id: string;
  enrollmentId: string;
  quizId: string;
  attemptNo: number;
  status: 'in_progress' | 'submitted' | 'graded';
  objectiveScore: number | null;
  manualScore: number | null;
  totalScore: number | null;
  isPassed: boolean | null;
  startedAt: string;
  submittedAt: string | null;
  gradedAt: string | null;
  timeSpentSeconds: number;
  timeLimitSeconds: number | null;
  timeRemainingSeconds: number | null;
  isTimedOut: boolean;

  quiz: {
    id: string;
    title: string;
    description: string | null;
    passScorePercent: number;
    timeLimitMinutes: number | null;
    maxAttempts: number | null;
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
  };

  questions: QuizAttemptQuestionDetail[];

  gradedBy: {
    id: string;
    fullName: string;
    email: string;
  } | null;
}

export interface QuizAttemptQuestionDetail {
  id: string;
  displayOrder: number;
  maxPoints: number;
  questionSnapshot: {
    questionText: string;
    questionType: 'single_choice' | 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
    explanation: string | null;
  };
  optionsSnapshot: Array<{
    optionId: string;
    optionText: string;
    orderIndex: number;
  }> | null;
  response: {
    id: string;
    responseText: string | null;
    selectedOptionIds: string[];
    isCorrect: boolean | null;
    awardedPoints: number;
    gradedAt: string | null;
  } | null;
}
