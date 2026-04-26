import { genAI, CHAT_MODEL, CODE_LAB_REVIEW_SYSTEM_PROMPT } from '@/config/gemini.config';
import { logger } from '@/config/logger';
import { AppError } from '@/utils';
import type { EvaluateCodeInput, CodeLabLanguage } from '@/schemas/code-lab.schema';

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

const VALID_STATUS = new Set<OverallStatus>(['passed', 'failed', 'partial', 'error']);
const VALID_DIAG_TYPE = new Set<DiagnosticType>(['error', 'warning', 'suggestion']);
const VALID_SEVERITY = new Set<Severity>(['high', 'medium', 'low']);

const truncate = (s: string, max: number): string =>
  s.length > max ? `${s.slice(0, max - 1)}…` : s;

const sanitizeStatus = (raw: unknown, fallback: OverallStatus): OverallStatus =>
  typeof raw === 'string' && VALID_STATUS.has(raw as OverallStatus)
    ? (raw as OverallStatus)
    : fallback;

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

    // Score (clamped) and overallStatus (re-derived from test results for safety)
    const score = clampScore(root.score);
    const fallbackStatus: OverallStatus =
      testResults.length === 0
        ? 'error'
        : testResults.every((t) => t.passed)
          ? 'passed'
          : testResults.some((t) => t.passed)
            ? 'partial'
            : 'failed';
    const overallStatus = sanitizeStatus(root.overallStatus, fallbackStatus);

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
}
