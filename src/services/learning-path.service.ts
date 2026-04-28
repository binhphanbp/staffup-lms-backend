/**
 * Module 1 — Lộ trình Học tập Thích ứng (DB + AI orchestration).
 *
 * Pure algorithm (classify / topoSortToLearn / prune / wouldCreateCycle) đã được
 * tách ra `@/utils/learning-path.algo` để chạy verify script không cần env DB/AI.
 *
 * Public API ở file này:
 *   - getGraph(), getPassedSetForUser(), previewForUser(), generateEmail()
 *   - admin CRUD: addEdge / removeEdge / setTestResults
 */
import { prisma } from '@/config/database';
import { generateContentWithFallback } from '@/utils/ai-generate';
import { logger } from '@/config/logger';
import { LEARNING_ADVISOR_SYSTEM_PROMPT } from '@/config/gemini.config';
import { ensureModuleEnabled, getEffectiveConfig } from '@/services/ai-config.service';
import { AppError } from '@/utils';
import {
  classify,
  prune,
  topoSortToLearn,
  wouldCreateCycle,
  type ClassifiedNode,
  type CurriculumEdgeDto,
  type CurriculumNodeDto,
  type NodeStatus,
  type PreviewResult,
} from '@/utils/learning-path.algo';

// Re-export pure algorithm + types để các caller bên ngoài tiếp tục import
// từ '@/services/learning-path.service' không bị break.
export { classify, prune, topoSortToLearn, wouldCreateCycle };
export type { ClassifiedNode, CurriculumEdgeDto, CurriculumNodeDto, NodeStatus, PreviewResult };

export interface EmployeeSnapshot {
  fullName: string;
  position: string;
  department: string;
  startDate?: string;
  testScore?: number;
}

export interface GeneratedEmail {
  subject: string;
  body: string;
  metadata: {
    employeeName: string;
    totalLessons: number;
    exemptedCount: number;
    toLearnCount: number;
    prunedPercent: number;
  };
}

// ─── DB I/O ─────────────────────────────────────────────────────────────────

export async function getGraph(): Promise<{
  nodes: CurriculumNodeDto[];
  edges: CurriculumEdgeDto[];
}> {
  const [nodes, edges] = await Promise.all([
    prisma.curriculumNode.findMany({
      orderBy: { id: 'asc' },
      select: { id: true, title: true, category: true, estimatedHours: true, description: true },
    }),
    prisma.curriculumEdge.findMany({
      orderBy: { id: 'asc' },
      select: { id: true, fromId: true, toId: true },
    }),
  ]);
  return { nodes, edges };
}

export async function getPassedSetForUser(userId: bigint): Promise<Set<string>> {
  const rows = await prisma.employeeSkillTestResult.findMany({
    where: { userId },
    select: { nodeId: true },
  });
  return new Set(rows.map((r) => r.nodeId));
}

export async function previewForUser(
  userId: bigint | null,
  overridePassed?: string[],
): Promise<PreviewResult> {
  const graph = await getGraph();
  const passedSet =
    overridePassed !== undefined
      ? new Set(overridePassed)
      : userId !== null
        ? await getPassedSetForUser(userId)
        : new Set<string>();
  return prune(graph.nodes, graph.edges, passedSet);
}

// ─── Admin CRUD (BGK đổi data live) ─────────────────────────────────────────

/**
 * Validate cycle BEFORE insert: dùng pure-algo `wouldCreateCycle` trên graph hiện có.
 */
async function validateNoCycleWithEdge(fromId: string, toId: string): Promise<void> {
  const { nodes, edges } = await getGraph();
  if (
    wouldCreateCycle(
      nodes,
      edges.map((e) => ({ fromId: e.fromId, toId: e.toId })),
      { fromId, toId },
    )
  ) {
    throw new AppError('Cạnh này tạo chu trình trong DAG, không thể thêm.', 400);
  }
}

export async function addEdge(fromId: string, toId: string) {
  if (fromId === toId) throw new AppError('Cạnh tự-vòng không hợp lệ.', 400);
  const [from, to] = await Promise.all([
    prisma.curriculumNode.findUnique({ where: { id: fromId } }),
    prisma.curriculumNode.findUnique({ where: { id: toId } }),
  ]);
  if (!from) throw new AppError(`Node ${fromId} không tồn tại.`, 404);
  if (!to) throw new AppError(`Node ${toId} không tồn tại.`, 404);

  const existing = await prisma.curriculumEdge.findUnique({
    where: { fromId_toId: { fromId, toId } },
  });
  if (existing) throw new AppError('Cạnh này đã tồn tại.', 409);

  await validateNoCycleWithEdge(fromId, toId);

  return prisma.curriculumEdge.create({
    data: { fromId, toId },
    select: { id: true, fromId: true, toId: true },
  });
}

export async function removeEdge(edgeId: number) {
  const existing = await prisma.curriculumEdge.findUnique({ where: { id: edgeId } });
  if (!existing) throw new AppError('Cạnh không tồn tại.', 404);
  await prisma.curriculumEdge.delete({ where: { id: edgeId } });
  return { ok: true };
}

export async function setTestResults(userId: bigint, nodeIds: string[]) {
  await prisma.employeeSkillTestResult.deleteMany({ where: { userId } });
  if (nodeIds.length > 0) {
    await prisma.employeeSkillTestResult.createMany({
      data: nodeIds.map((nodeId) => ({ userId, nodeId, source: 'manual', score: 80 })),
      skipDuplicates: true,
    });
  }
  return { ok: true, count: nodeIds.length };
}

// ─── AI: Generate Email ─────────────────────────────────────────────────────

// Default prompt: re-export tu gemini.config de caller cu van doc duoc. Override that
// la qua cfg.prompts.learningAdvisorSystemPrompt (admin chinh o /ai-configuration).
export const DEFAULT_LEARNING_ADVISOR_PROMPT = LEARNING_ADVISOR_SYSTEM_PROMPT;

function groupByLayer(toLearn: ClassifiedNode[]): ClassifiedNode[][] {
  const byLayer = new Map<number, ClassifiedNode[]>();
  for (const n of toLearn) {
    if (!byLayer.has(n.layer)) byLayer.set(n.layer, []);
    byLayer.get(n.layer)!.push(n);
  }
  return [...byLayer.entries()].sort(([a], [b]) => a - b).map(([, list]) => list);
}

function buildUserPrompt(employee: EmployeeSnapshot, preview: PreviewResult): string {
  const weeks = groupByLayer(preview.toLearnInOrder);
  const exemptedList = preview.exempted.length
    ? preview.exempted.map((l) => `- ${l.id}: ${l.title} (${l.category})`).join('\n')
    : '(chưa miễn bài nào)';
  const weeksList = weeks.length
    ? weeks
        .map(
          (week, i) =>
            `Tuần ${i + 1}:\n${week.map((l) => `  - ${l.id}: ${l.title} (${l.estimatedHours}h, ${l.category})`).join('\n')}`,
        )
        .join('\n')
    : '(không có bài phải học)';

  return `Thông tin nhân viên:
- Tên: ${employee.fullName}
- Vị trí: ${employee.position}
- Phòng ban: ${employee.department}
- Ngày bắt đầu: ${employee.startDate ?? 'chưa xác định'}
- Điểm bài test đầu vào: ${employee.testScore ?? 'N/A'}/100

Tổng số bài: ${preview.totalLessons}
Số bài MIỄN (đã pass test): ${preview.exempted.length}
Số bài PHẢI HỌC: ${preview.toLearnInOrder.length}
Lộ trình rút ngắn: ${preview.prunedPercent}%

Các bài MIỄN:
${exemptedList}

Các bài PHẢI HỌC theo thứ tự (đã chia tuần theo prerequisite layer):
${weeksList}

Yêu cầu: Soạn email theo NGUYÊN TẮC BẮT BUỘC. Trả CHỈ JSON {"subject", "body"}.`;
}

function tryParseEmailJson(raw: string): { subject: string; body: string } | null {
  // Gemini đôi khi vẫn trả markdown fence dù đã đặt responseMimeType
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/```\s*$/, '')
    .trim();
  try {
    const j = JSON.parse(cleaned);
    if (typeof j?.subject === 'string' && typeof j?.body === 'string') return j;
  } catch {
    /* fall through */
  }
  // Regex extract first JSON-like block
  const m = cleaned.match(/\{[\s\S]*\}/);
  if (m) {
    try {
      const j = JSON.parse(m[0]);
      if (typeof j?.subject === 'string' && typeof j?.body === 'string') return j;
    } catch {
      /* nothing */
    }
  }
  return null;
}

function buildFallbackEmail(
  employee: EmployeeSnapshot,
  preview: PreviewResult,
): { subject: string; body: string } {
  const weeks = groupByLayer(preview.toLearnInOrder);
  const subject = `Chào mừng ${employee.fullName} — Lộ trình học tập cá nhân hóa của bạn`;
  const body = [
    `Xin chào ${employee.fullName},`,
    '',
    `Chúc mừng bạn đã hoàn thành Bài Test đánh giá năng lực đầu vào tại vị trí **${employee.position}** — **${employee.department}**.`,
    '',
    '## Những kỹ năng bạn đã làm chủ',
    preview.exempted.length
      ? preview.exempted.map((l) => `- **${l.title}** (${l.id})`).join('\n')
      : '_Bạn sẽ bắt đầu lộ trình từ đầu — đừng lo, chương trình được thiết kế tăng tiến._',
    '',
    `## Lộ trình tinh gọn — rút ngắn ${preview.prunedPercent}%`,
    weeks
      .map(
        (week, i) =>
          `**Tuần ${i + 1}:**\n${week.map((l) => `- ${l.id}: ${l.title} (${l.estimatedHours}h)`).join('\n')}`,
      )
      .join('\n\n'),
    '',
    'Hành trình bắt đầu hôm nay. Chúng tôi tin bạn sẽ thành công.',
    '',
    'Trân trọng,',
    'Phòng L&D — Staffup',
  ].join('\n');
  return { subject, body };
}

export async function generateEmail(
  employee: EmployeeSnapshot,
  preview: PreviewResult,
): Promise<GeneratedEmail> {
  await ensureModuleEnabled('learningAdvisor', 'Cố vấn Đào tạo (Learning Advisor)');

  const cfg = await getEffectiveConfig();
  const systemInstruction = cfg.prompts.learningAdvisorSystemPrompt;

  const userPrompt = buildUserPrompt(employee, preview);

  let parsed: { subject: string; body: string } | null = null;
  try {
    const result = await generateContentWithFallback({
      model: cfg.chatModel,
      contents: [{ role: 'user' as const, parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 8000,
        // Disable Gemini 2.5 Flash "thinking" tokens — we want answer tokens only
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: 'application/json',
      },
    });
    const text = result.text ?? '';
    logger.info(
      `[learning-path] Gemini raw response (${text.length} chars): ${text.slice(0, 150)}`,
    );
    parsed = tryParseEmailJson(text);
    if (!parsed) {
      logger.warn(
        `[learning-path] Gemini response không parse được JSON, dùng fallback. Raw len=${text.length} preview=${text.slice(0, 300)}`,
      );
    }
  } catch (err) {
    logger.error('[learning-path] Gemini generateContent failed:', err);
  }

  const email = parsed ?? buildFallbackEmail(employee, preview);

  return {
    subject: email.subject,
    body: email.body,
    metadata: {
      employeeName: employee.fullName,
      totalLessons: preview.totalLessons,
      exemptedCount: preview.exempted.length,
      toLearnCount: preview.toLearnInOrder.length,
      prunedPercent: preview.prunedPercent,
    },
  };
}
