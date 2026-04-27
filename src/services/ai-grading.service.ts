import { prisma } from '@/config/database';
import type { Prisma } from '@prisma/client';
import { genAI } from '@/config/gemini.config';
import { ensureModuleEnabled, getEffectiveConfig } from '@/services/ai-config.service';
import { logger } from '@/config/logger';
import { AppError } from '@/utils';

// ========================
// Types
// ========================

interface RubricBreakdownItem {
  criterion: string;
  score: number;
  maxScore: number;
  comment: string;
}

interface GradingResult {
  attemptQuestionId: string;
  questionContent: string;
  suggestedScore: number;
  maxScore: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  rubricBreakdown: RubricBreakdownItem[];
}

interface BatchGradingResult {
  quizAttemptId: string;
  totalEssayQuestions: number;
  gradedCount: number;
  skippedCount: number;
  results: GradingResult[];
}

// ========================
// AI Essay Grading
// ========================

/**
 * Grade a single essay response using Gemini AI.
 * Fetches the question, rubric (from explanation), and learner's response,
 * then returns structured feedback with suggested score.
 */
export const gradeEssay = async (attemptQuestionId: bigint): Promise<GradingResult> => {
  await ensureModuleEnabled('autoGrader', 'Chấm điểm Tự luận Tự động');
  const cfg = await getEffectiveConfig();
  // Fetch the attempt question with all related data
  const attemptQuestion = await prisma.quizAttemptQuestion.findUnique({
    where: { id: attemptQuestionId },
    include: {
      question: {
        select: {
          id: true,
          questionType: true,
          content: true,
          explanation: true,
          defaultPoints: true,
        },
      },
      response: {
        select: {
          id: true,
          responseText: true,
          awardedPoints: true,
          aiSuggestedScore: true,
          aiGradedAt: true,
        },
      },
    },
  });

  if (!attemptQuestion) {
    throw new AppError('Câu hỏi trong bài thi không tồn tại.', 404);
  }

  if (attemptQuestion.question.questionType !== 'essay') {
    throw new AppError('Chỉ hỗ trợ chấm tự động cho câu hỏi tự luận (essay).', 400);
  }

  if (!attemptQuestion.response) {
    throw new AppError('Học viên chưa trả lời câu hỏi này.', 400);
  }

  const { question, response } = attemptQuestion;
  const responseText = response.responseText || '';
  const maxPoints = attemptQuestion.maxPoints;

  // Build the grading prompt
  const rubric = question.explanation
    ? `\n**Rubric/Tiêu chí chấm điểm:**\n${question.explanation}`
    : '\n**Rubric:** Không có rubric cụ thể. Hãy đánh giá dựa trên: (1) Độ chính xác, (2) Độ đầy đủ, (3) Tính logic, (4) Cách trình bày.';

  const gradingPrompt = `Hãy chấm bài tự luận sau:

**Câu hỏi:**
${question.content}
${rubric}

**Điểm tối đa:** ${maxPoints} điểm

**Bài làm của học viên:**
${responseText.trim().length > 0 ? responseText : '(Bài làm trống — học viên không trả lời)'}

Hãy đánh giá và trả về JSON theo format đã quy định.`;

  // Call Gemini
  let aiResponse: string;
  try {
    const result = await genAI.models.generateContent({
      model: cfg.chatModel,
      contents: [
        {
          role: 'user' as const,
          parts: [{ text: gradingPrompt }],
        },
      ],
      config: {
        systemInstruction: cfg.prompts.gradingSystemPrompt,
        temperature: 0.2, // Low temperature for consistent grading
        maxOutputTokens: 2048,
      },
    });

    aiResponse = result.text ?? '';
  } catch (error) {
    logger.error(`Gemini grading error for attemptQuestion ${attemptQuestionId}:`, error);
    throw new AppError('Lỗi khi gọi AI chấm bài. Vui lòng thử lại.', 500);
  }

  // Parse JSON response from Gemini
  let parsedResult: {
    suggestedScore: number;
    maxScore: number;
    feedback: string;
    strengths: string[];
    weaknesses: string[];
    rubricBreakdown: RubricBreakdownItem[];
  };

  try {
    // Clean response: remove potential markdown code blocks
    let cleanResponse = aiResponse.trim();
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.slice(7);
    }
    if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.slice(3);
    }
    if (cleanResponse.endsWith('```')) {
      cleanResponse = cleanResponse.slice(0, -3);
    }
    cleanResponse = cleanResponse.trim();

    parsedResult = JSON.parse(cleanResponse);
  } catch {
    logger.error(
      `Failed to parse Gemini grading response for attemptQuestion ${attemptQuestionId}:`,
      aiResponse,
    );

    // Fallback: construct a basic result
    parsedResult = {
      suggestedScore: 0,
      maxScore: maxPoints,
      feedback: 'AI không thể phân tích bài làm. Vui lòng chấm thủ công.',
      strengths: [],
      weaknesses: ['Không thể phân tích tự động'],
      rubricBreakdown: [],
    };
  }

  // Validate and clamp the score
  const suggestedScore = Math.min(Math.max(0, Number(parsedResult.suggestedScore) || 0), maxPoints);

  // Save AI grading result to database
  await prisma.attemptResponse.update({
    where: { id: response.id },
    data: {
      aiSuggestedScore: suggestedScore,
      aiFeedback: {
        feedback: parsedResult.feedback || '',
        strengths: parsedResult.strengths || [],
        weaknesses: parsedResult.weaknesses || [],
        rubricBreakdown: parsedResult.rubricBreakdown || [],
      } as unknown as Prisma.InputJsonValue,
      aiGradedAt: new Date(),
    },
  });

  logger.info(`✅ AI graded attemptQuestion ${attemptQuestionId}: ${suggestedScore}/${maxPoints}`);

  return {
    attemptQuestionId: attemptQuestionId.toString(),
    questionContent: question.content.slice(0, 100) + (question.content.length > 100 ? '...' : ''),
    suggestedScore,
    maxScore: maxPoints,
    feedback: parsedResult.feedback || '',
    strengths: parsedResult.strengths || [],
    weaknesses: parsedResult.weaknesses || [],
    rubricBreakdown: parsedResult.rubricBreakdown || [],
  };
};

// ========================
// Batch Essay Grading
// ========================

/**
 * Grade all essay questions in a quiz attempt.
 * Processes sequentially with rate limiting to respect Gemini API constraints.
 */
export const gradeQuizEssays = async (quizAttemptId: bigint): Promise<BatchGradingResult> => {
  // Verify the quiz attempt exists
  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: quizAttemptId },
    select: {
      id: true,
      status: true,
      quiz: { select: { title: true } },
    },
  });

  if (!attempt) {
    throw new AppError('Bài thi không tồn tại.', 404);
  }

  if (attempt.status !== 'submitted' && attempt.status !== 'graded') {
    throw new AppError('Chỉ có thể chấm bài thi đã nộp (submitted) hoặc đã chấm (graded).', 400);
  }

  // Find all essay questions in this attempt
  const essayQuestions = await prisma.quizAttemptQuestion.findMany({
    where: {
      attemptId: quizAttemptId,
      question: { questionType: 'essay' },
    },
    select: {
      id: true,
      question: { select: { content: true } },
      response: { select: { responseText: true } },
    },
    orderBy: { displayOrder: 'asc' },
  });

  if (essayQuestions.length === 0) {
    throw new AppError('Bài thi này không có câu hỏi tự luận nào.', 400);
  }

  logger.info(
    `📝 Grading ${essayQuestions.length} essay questions for attempt ${quizAttemptId} ("${attempt.quiz.title}")`,
  );

  const results: GradingResult[] = [];
  let gradedCount = 0;
  let skippedCount = 0;

  for (const eq of essayQuestions) {
    try {
      // Skip if no response text
      if (!eq.response || !eq.response.responseText?.trim()) {
        logger.warn(`Skipping attemptQuestion ${eq.id}: no response text`);
        skippedCount++;
        continue;
      }

      const result = await gradeEssay(eq.id);
      results.push(result);
      gradedCount++;

      // Rate limit: 300ms delay between Gemini calls
      if (gradedCount < essayQuestions.length) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    } catch (error) {
      logger.error(`Failed to grade attemptQuestion ${eq.id}:`, error);
      skippedCount++;
    }
  }

  logger.info(`✅ Batch grading complete: ${gradedCount} graded, ${skippedCount} skipped`);

  return {
    quizAttemptId: quizAttemptId.toString(),
    totalEssayQuestions: essayQuestions.length,
    gradedCount,
    skippedCount,
    results,
  };
};
