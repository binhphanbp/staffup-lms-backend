/**
 * Module 1 — Lộ trình Học tập Thích ứng
 *
 * Algorithm:
 *   - classify(): O(V+E) — phân loại 3 trạng thái (exempt/available/locked) cho mọi node.
 *   - topoSortToLearn(): Kahn's BFS deterministic — sắp xếp các bài chưa pass theo prereq.
 *   - prune(): orchestrator — gọi classify rồi topoSort.
 *
 * Quy ước nghiệp vụ quan trọng:
 *   - KHÔNG bắc cầu prerequisite. Pass B không tự suy ra biết A (dù A là prereq B).
 *     Lý do: bài test chỉ kiểm B, nhân viên có thể đã làm B trong job cũ nhưng chưa
 *     học A bài bản.
 *   - Topo deterministic: sort alphabetical trong cùng layer để demo lặp lại được.
 *
 * Public API:
 *   - getGraph(), getPassedSetForUser(), previewForUser(), generateEmail(),
 *     plus admin CRUD: addEdge / removeEdge / setTestResults / removeTestResult.
 */
import { prisma } from '@/config/database';
import { logger } from '@/config/logger';
import { genAI } from '@/config/gemini.config';
import { ensureModuleEnabled, getEffectiveConfig } from '@/services/ai-config.service';
import { AppError } from '@/utils';

// ─── Types ──────────────────────────────────────────────────────────────────

export type NodeStatus = 'exempt' | 'available' | 'locked';

export interface CurriculumNodeDto {
  id: string;
  title: string;
  category: string;
  estimatedHours: number;
  description: string;
}

export interface CurriculumEdgeDto {
  id: number;
  fromId: string;
  toId: string;
}

export interface ClassifiedNode {
  id: string;
  title: string;
  category: string;
  estimatedHours: number;
  description: string;
  status: NodeStatus;
  unmetPrereqs: string[];
  layer: number;
}

export interface PreviewResult {
  totalLessons: number;
  exempted: ClassifiedNode[];
  available: ClassifiedNode[];
  locked: ClassifiedNode[];
  toLearnInOrder: ClassifiedNode[]; // available + locked, đã topo sort
  prunedPercent: number; // làm tròn 0 chữ số
  classified: Record<string, ClassifiedNode>;
}

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

// ─── Algorithm ──────────────────────────────────────────────────────────────

/**
 * Phân loại 3 trạng thái KHÔNG bắc cầu.
 * - exempt: passedSet.has(node)
 * - available: prereqs trực tiếp đều exempt
 * - locked: còn ≥1 prereq chưa exempt
 */
export function classify(
  nodes: CurriculumNodeDto[],
  edges: { fromId: string; toId: string }[],
  passedSet: Set<string>,
): Map<string, ClassifiedNode> {
  const prereqsOf = new Map<string, string[]>();
  for (const n of nodes) prereqsOf.set(n.id, []);
  for (const e of edges) {
    if (!prereqsOf.has(e.toId)) prereqsOf.set(e.toId, []);
    prereqsOf.get(e.toId)!.push(e.fromId);
  }

  const result = new Map<string, ClassifiedNode>();
  for (const node of nodes) {
    if (passedSet.has(node.id)) {
      result.set(node.id, { ...node, status: 'exempt', unmetPrereqs: [], layer: -1 });
      continue;
    }
    const prereqs = prereqsOf.get(node.id) ?? [];
    const unmet = prereqs.filter((p) => !passedSet.has(p));
    if (unmet.length === 0) {
      result.set(node.id, { ...node, status: 'available', unmetPrereqs: [], layer: 0 });
    } else {
      result.set(node.id, { ...node, status: 'locked', unmetPrereqs: unmet.sort(), layer: -1 });
    }
  }
  return result;
}

/**
 * Topo sort Kahn's BFS — chỉ trên subgraph các node CHƯA pass.
 * Trả về thứ tự học chính xác, ghi `layer` cho mỗi node để FE có thể group "theo tuần".
 * Throw nếu subgraph có chu trình.
 */
export function topoSortToLearn(
  nodes: CurriculumNodeDto[],
  edges: { fromId: string; toId: string }[],
  classified: Map<string, ClassifiedNode>,
): ClassifiedNode[] {
  // Subgraph: các node không exempt
  const inSub = new Set<string>();
  for (const [id, c] of classified) {
    if (c.status !== 'exempt') inSub.add(id);
  }

  // Chỉ giữ edges từ→đến đều ở trong subgraph
  const subEdges = edges.filter((e) => inSub.has(e.fromId) && inSub.has(e.toId));

  // In-degree
  const inDegree = new Map<string, number>();
  for (const id of inSub) inDegree.set(id, 0);
  for (const e of subEdges) inDegree.set(e.toId, (inDegree.get(e.toId) ?? 0) + 1);

  // Adjacency
  const adj = new Map<string, string[]>();
  for (const id of inSub) adj.set(id, []);
  for (const e of subEdges) adj.get(e.fromId)!.push(e.toId);

  const sorted: ClassifiedNode[] = [];
  let frontier = [...inSub].filter((id) => inDegree.get(id) === 0).sort();
  let layer = 0;

  while (frontier.length > 0) {
    const next: string[] = [];
    for (const id of frontier) {
      const node = classified.get(id)!;
      node.layer = layer;
      sorted.push(node);
      for (const v of adj.get(id) ?? []) {
        const d = (inDegree.get(v) ?? 0) - 1;
        inDegree.set(v, d);
        if (d === 0) next.push(v);
      }
    }
    frontier = next.sort();
    layer++;
  }

  if (sorted.length !== inSub.size) {
    throw new AppError('Graph chứa chu trình — không thể tạo lộ trình.', 400);
  }
  return sorted;
}

/**
 * Composer: gom classify + topoSort + thống kê.
 */
export function prune(
  nodes: CurriculumNodeDto[],
  edges: { fromId: string; toId: string }[],
  passedSet: Set<string>,
): PreviewResult {
  const classified = classify(nodes, edges, passedSet);
  const toLearnInOrder = topoSortToLearn(nodes, edges, classified);

  const exempted: ClassifiedNode[] = [];
  const available: ClassifiedNode[] = [];
  const locked: ClassifiedNode[] = [];
  const obj: Record<string, ClassifiedNode> = {};
  for (const [id, c] of classified) {
    obj[id] = c;
    if (c.status === 'exempt') exempted.push(c);
    else if (c.status === 'available') available.push(c);
    else locked.push(c);
  }

  const total = nodes.length;
  const prunedPercent = total === 0 ? 0 : Math.round((exempted.length / total) * 100);

  return {
    totalLessons: total,
    exempted: exempted.sort((a, b) => a.id.localeCompare(b.id)),
    available: available.sort((a, b) => a.id.localeCompare(b.id)),
    locked: locked.sort((a, b) => a.id.localeCompare(b.id)),
    toLearnInOrder,
    prunedPercent,
    classified: obj,
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
 * Validate cycle BEFORE insert: thêm cạnh tạm vào graph rồi topo-sort all,
 * nếu kết quả size < |V| → có cycle → throw 400.
 */
async function validateNoCycleWithEdge(fromId: string, toId: string): Promise<void> {
  const { nodes, edges } = await getGraph();
  const all = [...edges.map((e) => ({ fromId: e.fromId, toId: e.toId })), { fromId, toId }];

  const inDeg = new Map<string, number>();
  for (const n of nodes) inDeg.set(n.id, 0);
  for (const e of all) inDeg.set(e.toId, (inDeg.get(e.toId) ?? 0) + 1);
  const adj = new Map<string, string[]>();
  for (const n of nodes) adj.set(n.id, []);
  for (const e of all) adj.get(e.fromId)?.push(e.toId);

  let queue = nodes.filter((n) => inDeg.get(n.id) === 0).map((n) => n.id);
  let visited = 0;
  while (queue.length) {
    const next: string[] = [];
    for (const id of queue) {
      visited++;
      for (const v of adj.get(id) ?? []) {
        const d = (inDeg.get(v) ?? 0) - 1;
        inDeg.set(v, d);
        if (d === 0) next.push(v);
      }
    }
    queue = next;
  }
  if (visited !== nodes.length) {
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

/**
 * Default prompt cho Learning Advisor — admin có thể override qua AiConfig.prompts.learningAdvisorSystemPrompt.
 */
export const DEFAULT_LEARNING_ADVISOR_PROMPT = `Bạn là **Staffup Learning Advisor** — Cố vấn Đào tạo của bộ phận L&D công ty.

VAI TRÒ: Soạn email "Chào mừng & Hướng dẫn Lộ trình cá nhân hóa" gửi cho nhân viên mới sau khi họ hoàn thành Bài Test đánh giá năng lực đầu vào.

NGUYÊN TẮC BẮT BUỘC:
1. Tone: chuyên nghiệp, ấm áp, động viên — KHÔNG sáo rỗng AI-speak.
2. Cá nhân hóa: gọi tên thật, công nhận cụ thể kỹ năng đã có.
3. Ngữ cảnh nghiệp vụ: liên kết kỹ năng với công việc thực tế của vị trí.
4. Cấu trúc 4 đoạn:
   §1. Lời chào + chúc mừng vượt qua test (1-2 câu)
   §2. Công nhận skill: liệt kê bài MIỄN, giải thích vì sao có ý nghĩa (2-3 câu)
   §3. Lộ trình tinh gọn: chia theo TUẦN (gom layer 0 → tuần 1, layer 1 → tuần 2, …)
       với CTA cụ thể từng tuần.
   §4. Lời động viên + chữ ký (Trân trọng, Phòng L&D — Staffup)
5. Nhắc % rút ngắn cụ thể.
6. KHÔNG bịa bài học hay deadline ngoài data được cung cấp.

ĐẦU RA: trả về CHỈ MỘT object JSON thuần với 2 field:
{ "subject": "...", "body": "..." }
- subject: ≤80 ký tự, có chứa tên nhân viên.
- body: markdown thuần (## heading, ** bold, - bullet).
KHÔNG kèm giải thích thừa, KHÔNG markdown fence.`;

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
  await ensureModuleEnabled('chatbot', 'Cố vấn Đào tạo (Learning Advisor)');

  const cfg = await getEffectiveConfig();
  const systemInstruction =
    (cfg as unknown as { prompts?: Record<string, string> }).prompts?.learningAdvisorSystemPrompt ||
    DEFAULT_LEARNING_ADVISOR_PROMPT;

  const userPrompt = buildUserPrompt(employee, preview);

  let parsed: { subject: string; body: string } | null = null;
  try {
    const result = await genAI.models.generateContent({
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
