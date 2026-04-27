import type { Prisma } from '@prisma/client';
import { prisma } from '@/config/database';
import { genAI, CHAT_MODEL, CODE_LAB_REVIEW_SYSTEM_PROMPT } from '@/config/gemini.config';
import { logger } from '@/config/logger';
import { AppError } from '@/utils';
import type {
  EvaluateCodeInput,
  CodeLabLanguage,
  ListProblemsQuery,
  ListSubmissionsQuery,
  SubmitProblemInput,
} from '@/schemas/code-lab.schema';

// ====================================================================
// Actor & permission helpers
// ====================================================================

interface ActorContext {
  userId: bigint;
  roleCodes: string[];
}

const isAdmin = (actor: ActorContext): boolean => actor.roleCodes.includes('admin');
const isTrainerOrAdmin = (actor: ActorContext): boolean =>
  actor.roleCodes.includes('admin') || actor.roleCodes.includes('trainer');

// ====================================================================
// Types
// ====================================================================

type OverallStatus = 'passed' | 'failed' | 'partial' | 'error';
type DiagnosticType = 'error' | 'warning' | 'suggestion';
type Severity = 'high' | 'medium' | 'low';

export interface CodeLabTestResult {
  testCaseIndex: number;
  input: string;
  expectedOutput: string;
  simulatedOutput: string;
  passed: boolean;
  explanation: string;
}

export interface CodeLabDiagnostic {
  type: DiagnosticType;
  severity: Severity;
  title: string;
  description: string;
  lineHint: number | null;
}

export interface CodeLabEvaluationResult {
  overallStatus: OverallStatus;
  score: number;
  summary: string;
  testResults: CodeLabTestResult[];
  diagnostics: CodeLabDiagnostic[];
  suggestions: string[];
  language: CodeLabLanguage;
  model: string;
  generatedAt: string;
}

// ====================================================================
// Helpers
// ====================================================================

const stripCodeFences = (raw: string): string => {
  let text = raw.trim();
  if (text.startsWith('```json')) text = text.slice(7);
  else if (text.startsWith('```')) text = text.slice(3);
  if (text.endsWith('```')) text = text.slice(0, -3);
  return text.trim();
};

const VALID_DIAG_TYPE = new Set<DiagnosticType>(['error', 'warning', 'suggestion']);
const VALID_SEVERITY = new Set<Severity>(['high', 'medium', 'low']);

const truncate = (s: string, max: number): string =>
  s.length > max ? `${s.slice(0, max - 1)}…` : s;

const sanitizeDiagType = (raw: unknown): DiagnosticType =>
  typeof raw === 'string' && VALID_DIAG_TYPE.has(raw as DiagnosticType)
    ? (raw as DiagnosticType)
    : 'suggestion';

const sanitizeSeverity = (raw: unknown): Severity =>
  typeof raw === 'string' && VALID_SEVERITY.has(raw as Severity) ? (raw as Severity) : 'medium';

const clampScore = (raw: unknown): number => {
  if (typeof raw !== 'number' || !Number.isFinite(raw)) return 0;
  return Math.max(0, Math.min(100, Math.round(raw)));
};

// ====================================================================
// Service
// ====================================================================

export class CodeLabService {
  /**
   * Evaluate a code submission against a problem statement and (optionally)
   * test cases. Uses Gemini as both reviewer AND simulator — does NOT execute
   * the code in any sandbox. Output is structured, sanitised, and capped.
   */
  static async evaluate(input: EvaluateCodeInput): Promise<CodeLabEvaluationResult> {
    const userPrompt = this.buildUserPrompt(input);

    let aiResponse: string;
    try {
      const response = await genAI.models.generateContent({
        model: CHAT_MODEL,
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        config: {
          systemInstruction: CODE_LAB_REVIEW_SYSTEM_PROMPT,
          temperature: 0.2,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
        },
      });
      aiResponse = response.text?.trim() ?? '';
    } catch (err) {
      logger.error(
        `[CodeLab] Gemini call failed: ${err instanceof Error ? err.message : String(err)}`,
      );
      throw new AppError('AI service unavailable. Please try again later.', 502);
    }

    if (!aiResponse) {
      throw new AppError('AI service returned an empty response.', 502);
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(stripCodeFences(aiResponse));
    } catch (err) {
      logger.error(
        `[CodeLab] Failed to parse Gemini JSON: ${err instanceof Error ? err.message : String(err)} | raw=${aiResponse.slice(0, 200)}`,
      );
      throw new AppError('AI service returned malformed JSON.', 502);
    }

    return this.sanitize(parsed, input);
  }

  // ----------------------------------------------------------------
  // Prompt builder
  // ----------------------------------------------------------------

  private static buildUserPrompt(input: EvaluateCodeInput): string {
    const testCases = input.testCases ?? [];
    const testCasesBlock =
      testCases.length > 0
        ? testCases
            .map(
              (tc, i) =>
                `Test case #${i}${tc.description ? ` — ${tc.description}` : ''}\nINPUT:\n${tc.input}\nEXPECTED OUTPUT:\n${tc.expectedOutput}`,
            )
            .join('\n\n---\n\n')
        : '(Không có test case — tự nghĩ 2-3 test case hợp lý dựa trên problem statement)';

    return `Đánh giá bài code của học viên.

=== NGÔN NGỮ ===
${input.language}

=== ĐỀ BÀI (problemStatement) ===
${input.problemStatement}

=== CODE HỌC VIÊN SUBMIT ===
\`\`\`${input.language}
${input.code}
\`\`\`

=== TEST CASES ===
${testCasesBlock}

=== YÊU CẦU ===
- Trace từng test case bằng cách suy luận output từ code (KHÔNG thực thi).
- Trả về JSON đúng schema đã quy định trong system prompt.
- Ngôn ngữ phản hồi: ${input.language_response === 'en' ? 'English' : 'Tiếng Việt (mặc định)'}.`;
  }

  // ----------------------------------------------------------------
  // Sanitiser
  // ----------------------------------------------------------------

  private static sanitize(parsed: unknown, input: EvaluateCodeInput): CodeLabEvaluationResult {
    if (typeof parsed !== 'object' || parsed === null) {
      throw new AppError('AI returned a non-object response.', 502);
    }
    const root = parsed as Record<string, unknown>;

    // Test results
    const testResultsRaw = Array.isArray(root.testResults) ? root.testResults : [];
    const providedTestCount = input.testCases?.length ?? 0;
    const testResults: CodeLabTestResult[] = testResultsRaw
      .filter((r): r is Record<string, unknown> => typeof r === 'object' && r !== null)
      .map((r, idx) => {
        const tcIdxRaw = r.testCaseIndex;
        const upperBound = providedTestCount > 0 ? providedTestCount - 1 : Number.MAX_SAFE_INTEGER;
        const testCaseIndex =
          typeof tcIdxRaw === 'number' && Number.isFinite(tcIdxRaw)
            ? Math.max(0, Math.min(upperBound, Math.round(tcIdxRaw)))
            : Math.min(idx, upperBound);
        // If test cases were provided, anchor input/expectedOutput back to the
        // original to prevent hallucinated mutations. Out-of-range indices fall
        // through with no anchor (rather than reading undefined and returning
        // AI-fabricated values).
        const anchored =
          providedTestCount > 0 && testCaseIndex < providedTestCount
            ? input.testCases![testCaseIndex]
            : undefined;
        return {
          testCaseIndex,
          input: anchored?.input ?? truncate(typeof r.input === 'string' ? r.input : '', 2000),
          expectedOutput:
            anchored?.expectedOutput ??
            truncate(typeof r.expectedOutput === 'string' ? r.expectedOutput : '', 2000),
          simulatedOutput: truncate(
            typeof r.simulatedOutput === 'string' ? r.simulatedOutput : '',
            2000,
          ),
          passed: r.passed === true,
          explanation: truncate(
            typeof r.explanation === 'string' && r.explanation.trim().length > 0
              ? r.explanation.trim()
              : 'AI không cung cấp giải thích cho test case này.',
            800,
          ),
        };
      })
      .slice(0, 20);

    // Diagnostics
    const diagnosticsRaw = Array.isArray(root.diagnostics) ? root.diagnostics : [];
    const diagnostics: CodeLabDiagnostic[] = diagnosticsRaw
      .filter((d): d is Record<string, unknown> => typeof d === 'object' && d !== null)
      .map((d) => {
        const lineHintRaw = d.lineHint;
        const lineHint =
          typeof lineHintRaw === 'number' && Number.isFinite(lineHintRaw) && lineHintRaw > 0
            ? Math.round(lineHintRaw)
            : null;
        return {
          type: sanitizeDiagType(d.type),
          severity: sanitizeSeverity(d.severity),
          title: truncate(typeof d.title === 'string' ? d.title.trim() : 'Lưu ý', 80),
          description: truncate(typeof d.description === 'string' ? d.description.trim() : '', 500),
          lineHint,
        };
      })
      .filter((d) => d.description.length > 0)
      .slice(0, 8);

    // Suggestions
    const suggestionsRaw = Array.isArray(root.suggestions) ? root.suggestions : [];
    const suggestions: string[] = suggestionsRaw
      .filter((s): s is string => typeof s === 'string')
      .map((s) => truncate(s.trim(), 300))
      .filter((s) => s.length > 0)
      .slice(0, 5);

    // overallStatus and score — ALWAYS re-derive from sanitized testResults
    // rather than trust Gemini's self-reported values, otherwise an
    // inconsistent AI response (e.g. status=passed but every testResult has
    // passed=false because it returned "yes"/1 instead of true; or score=90
    // with status=failed) would leak through and contradict what the UI
    // shows the learner.
    const overallStatus: OverallStatus =
      testResults.length === 0
        ? 'error'
        : testResults.every((t) => t.passed)
          ? 'passed'
          : testResults.some((t) => t.passed)
            ? 'partial'
            : 'failed';

    // Score is clamped, then bounded to ranges consistent with overallStatus
    // so it can never contradict the per-test result. The system prompt
    // already defines score as "100 nếu pass tất cả + code sạch; 0 nếu syntax
    // error" — these caps/floors enforce that contract on the consumer side.
    const rawScore = clampScore(root.score);
    const passedCount = testResults.filter((t) => t.passed).length;
    const totalCount = testResults.length;
    const passRatio = totalCount > 0 ? passedCount / totalCount : 0;
    let score: number;
    switch (overallStatus) {
      case 'error':
        score = 0;
        break;
      case 'failed':
        // No tests passed — cap below "fair effort" threshold.
        score = Math.min(rawScore, 25);
        break;
      case 'partial': {
        // Bound score around the actual pass ratio (±15 points for code
        // quality / partial credit) so it tracks reality.
        const ratioScore = Math.round(passRatio * 100);
        score = Math.max(
          Math.max(15, ratioScore - 15),
          Math.min(rawScore, Math.min(85, ratioScore + 15)),
        );
        break;
      }
      case 'passed':
        // All tests passed — floor at 85 (above the partial-score ceiling) so
        // a fully-passing submission can never receive a lower score than a
        // partially-passing one. The partial branch caps at 85 (ratioScore + 15
        // clamped at 85), so passed must start at 85 to preserve monotonicity.
        score = Math.max(rawScore, 85);
        break;
    }

    const summary = truncate(
      typeof root.summary === 'string' && root.summary.trim().length > 0
        ? root.summary.trim()
        : 'AI đã đánh giá bài làm của bạn.',
      600,
    );

    return {
      overallStatus,
      score,
      summary,
      testResults,
      diagnostics,
      suggestions,
      language: input.language,
      model: CHAT_MODEL,
      generatedAt: new Date().toISOString(),
    };
  }

  // ================================================================
  // Multi-problem registry & submission persistence
  // ================================================================

  static async listProblems(query: ListProblemsQuery) {
    const where: Prisma.CodeLabProblemWhereInput = { isPublished: true };
    if (query.language) where.language = query.language;
    if (query.difficulty) where.difficulty = query.difficulty;
    if (query.q && query.q.trim().length > 0) {
      where.OR = [
        { title: { contains: query.q.trim(), mode: 'insensitive' } },
        { category: { contains: query.q.trim(), mode: 'insensitive' } },
      ];
    }

    const problems = await prisma.codeLabProblem.findMany({
      where,
      orderBy: [{ difficulty: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        slug: true,
        title: true,
        difficulty: true,
        category: true,
        language: true,
        tags: true,
        createdAt: true,
      },
    });

    return problems.map((p) => ({
      id: p.id.toString(),
      slug: p.slug,
      title: p.title,
      difficulty: p.difficulty,
      category: p.category,
      language: p.language as CodeLabLanguage,
      tags: p.tags,
      createdAt: p.createdAt.toISOString(),
    }));
  }

  static async getProblemBySlug(slug: string) {
    const problem = await prisma.codeLabProblem.findUnique({
      where: { slug },
    });
    if (!problem || !problem.isPublished) {
      throw new AppError('Bài lab không tồn tại hoặc đã ẩn.', 404);
    }
    return this.serializeProblem(problem);
  }

  static async submitToProblem(actor: ActorContext, slug: string, input: SubmitProblemInput) {
    const problem = await prisma.codeLabProblem.findUnique({ where: { slug } });
    if (!problem || !problem.isPublished) {
      throw new AppError('Bài lab không tồn tại hoặc đã ẩn.', 404);
    }

    const testCases = this.parseTestCases(problem.testCases);

    const evaluation = await this.evaluate({
      language: input.language,
      code: input.code,
      problemStatement: problem.problemStatement,
      testCases,
      language_response: input.language_response,
    });

    const submission = await prisma.codeSubmission.create({
      data: {
        problemId: problem.id,
        userId: actor.userId,
        language: input.language,
        code: input.code,
        status: evaluation.overallStatus,
        score: evaluation.score,
        summary: evaluation.summary,
        evaluation: evaluation as unknown as Prisma.InputJsonValue,
        model: evaluation.model,
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    return {
      submissionId: submission.id.toString(),
      submittedAt: submission.createdAt.toISOString(),
      problemSlug: problem.slug,
      evaluation,
    };
  }

  static async listMySubmissions(
    actor: ActorContext,
    slug: string | null,
    query: ListSubmissionsQuery,
  ) {
    const where: Prisma.CodeSubmissionWhereInput = { userId: actor.userId };
    if (slug) {
      const problem = await prisma.codeLabProblem.findUnique({
        where: { slug },
        select: { id: true },
      });
      if (!problem) {
        throw new AppError('Bài lab không tồn tại.', 404);
      }
      where.problemId = problem.id;
    }
    if (query.status) where.status = query.status;

    const rows = await prisma.codeSubmission.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: query.limit,
      include: {
        problem: { select: { slug: true, title: true, difficulty: true, category: true } },
      },
    });

    return rows.map((r) => this.serializeSubmission(r));
  }

  static async listProblemSubmissions(
    actor: ActorContext,
    slug: string,
    query: ListSubmissionsQuery,
  ) {
    if (!isTrainerOrAdmin(actor)) {
      throw new AppError('Chỉ admin hoặc trainer mới được xem submission của học viên.', 403);
    }

    const problem = await prisma.codeLabProblem.findUnique({
      where: { slug },
      select: { id: true, slug: true, title: true },
    });
    if (!problem) {
      throw new AppError('Bài lab không tồn tại.', 404);
    }

    const where: Prisma.CodeSubmissionWhereInput = { problemId: problem.id };
    if (query.status) where.status = query.status;

    const rows = await prisma.codeSubmission.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: query.limit,
      include: {
        problem: { select: { slug: true, title: true, difficulty: true, category: true } },
        user: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
      },
    });

    return rows.map((r) => this.serializeSubmission(r));
  }

  static async getSubmission(actor: ActorContext, submissionId: bigint) {
    const submission = await prisma.codeSubmission.findUnique({
      where: { id: submissionId },
      include: {
        problem: { select: { slug: true, title: true, difficulty: true, category: true } },
        user: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
      },
    });
    if (!submission) {
      throw new AppError('Submission không tồn tại.', 404);
    }

    if (!isAdmin(actor) && submission.userId.toString() !== actor.userId.toString()) {
      // trainers can also see their students' submissions for any published problem
      if (!actor.roleCodes.includes('trainer')) {
        throw new AppError('Bạn không có quyền xem submission này.', 403);
      }
    }

    return this.serializeSubmission(submission);
  }

  // ----------------------------------------------------------------
  // Serializers
  // ----------------------------------------------------------------

  private static serializeProblem(p: {
    id: bigint;
    slug: string;
    title: string;
    difficulty: string;
    category: string;
    language: string;
    problemStatement: string;
    starterCode: string;
    testCases: Prisma.JsonValue;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: p.id.toString(),
      slug: p.slug,
      title: p.title,
      difficulty: p.difficulty,
      category: p.category,
      language: p.language as CodeLabLanguage,
      problemStatement: p.problemStatement,
      starterCode: p.starterCode,
      testCases: this.parseTestCases(p.testCases),
      tags: p.tags,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    };
  }

  private static serializeSubmission(s: {
    id: bigint;
    problemId: bigint;
    userId: bigint;
    language: string;
    code: string;
    status: string;
    score: number;
    summary: string | null;
    evaluation: Prisma.JsonValue | null;
    model: string | null;
    createdAt: Date;
    problem: { slug: string; title: string; difficulty: string; category: string };
    user?: {
      id: bigint;
      fullName: string;
      email: string;
      avatarUrl: string | null;
    };
  }) {
    return {
      id: s.id.toString(),
      problemId: s.problemId.toString(),
      problemSlug: s.problem.slug,
      problemTitle: s.problem.title,
      problemDifficulty: s.problem.difficulty,
      problemCategory: s.problem.category,
      userId: s.userId.toString(),
      user: s.user
        ? {
            id: s.user.id.toString(),
            fullName: s.user.fullName,
            email: s.user.email,
            avatarUrl: s.user.avatarUrl,
          }
        : undefined,
      language: s.language as CodeLabLanguage,
      code: s.code,
      status: s.status,
      score: s.score,
      summary: s.summary,
      evaluation: s.evaluation,
      model: s.model,
      createdAt: s.createdAt.toISOString(),
    };
  }

  private static parseTestCases(raw: Prisma.JsonValue): {
    input: string;
    expectedOutput: string;
    description?: string;
  }[] {
    if (!Array.isArray(raw)) return [];
    const out: { input: string; expectedOutput: string; description?: string }[] = [];
    for (const tc of raw) {
      if (typeof tc !== 'object' || tc === null || Array.isArray(tc)) continue;
      const obj = tc as Record<string, unknown>;
      out.push({
        input: typeof obj.input === 'string' ? obj.input : '',
        expectedOutput: typeof obj.expectedOutput === 'string' ? obj.expectedOutput : '',
        description: typeof obj.description === 'string' ? obj.description : undefined,
      });
      if (out.length >= 10) break;
    }
    return out;
  }
}
