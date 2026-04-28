/**
 * Module 1 — Lộ trình Học tập Thích ứng (pure algorithm)
 *
 * Pure functions, no DB / no AI / no env access. Tách riêng để:
 *   - Verify script chạy được mà không cần DATABASE_URL/GEMINI_API_KEY
 *   - Unit test thuật toán độc lập với infra
 *
 * Quy ước nghiệp vụ:
 *   - KHÔNG bắc cầu prerequisite. Pass B không tự suy biết A (dù A là prereq B).
 *     Bài test chỉ kiểm B, nhân viên có thể đã làm B trong job cũ nhưng chưa
 *     học A bài bản.
 *   - Topo deterministic: sort alphabetical trong cùng layer để demo lặp lại được.
 */

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

/**
 * Phân loại 3 trạng thái KHÔNG bắc cầu.
 * - exempt: passedSet.has(node)
 * - available: prereqs trực tiếp đều exempt
 * - locked: còn ≥1 prereq chưa exempt
 *
 * Complexity: O(V + E)
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
 *
 * Complexity: O(V + E)
 */
export function topoSortToLearn(
  _nodes: CurriculumNodeDto[],
  edges: { fromId: string; toId: string }[],
  classified: Map<string, ClassifiedNode>,
): ClassifiedNode[] {
  const inSub = new Set<string>();
  for (const [id, c] of classified) {
    if (c.status !== 'exempt') inSub.add(id);
  }

  const subEdges = edges.filter((e) => inSub.has(e.fromId) && inSub.has(e.toId));

  const inDegree = new Map<string, number>();
  for (const id of inSub) inDegree.set(id, 0);
  for (const e of subEdges) inDegree.set(e.toId, (inDegree.get(e.toId) ?? 0) + 1);

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
    throw new Error('Graph chứa chu trình — không thể tạo lộ trình.');
  }
  return sorted;
}

/**
 * Composer: classify + topoSort + thống kê.
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

/**
 * Validate cycle BEFORE insert: thêm cạnh tạm vào graph rồi topo-sort all,
 * nếu visited < |V| → có cycle → trả false.
 */
export function wouldCreateCycle(
  nodes: { id: string }[],
  edges: { fromId: string; toId: string }[],
  newEdge: { fromId: string; toId: string },
): boolean {
  const all = [...edges, newEdge];

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
  return visited !== nodes.length;
}
