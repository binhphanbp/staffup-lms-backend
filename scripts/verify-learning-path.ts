/**
 * Verify thuật toán cho test scenario bắt buộc đề thi mục 5.
 * Chạy: pnpm tsx scripts/verify-learning-path.ts
 */
import { prune } from '../src/services/learning-path.service';

const nodes = [
  { id: 'A', title: 'A', category: 'company', estimatedHours: 1, description: '' },
  { id: 'B', title: 'B', category: 'company', estimatedHours: 1, description: '' },
  { id: 'C', title: 'C', category: 'company', estimatedHours: 1, description: '' },
  { id: 'D', title: 'D', category: 'company', estimatedHours: 1, description: '' },
];
const edges = [
  { fromId: 'A', toId: 'B' },
  { fromId: 'B', toId: 'D' },
  { fromId: 'C', toId: 'D' },
];

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error(`✗ FAIL: ${msg}`);
    process.exit(1);
  }
  console.log(`✓ ${msg}`);
}

console.log('\n=== Test scenario bắt buộc — Bước 2 ===\n');
const r = prune(nodes, edges, new Set(['B']));

assert(r.classified.B.status === 'exempt', 'B = Exempt (đã pass)');
assert(
  r.classified.A.status === 'available',
  'A = Available (KHÔNG bắc cầu — pass B không tự suy A)',
);
assert(r.classified.C.status === 'available', 'C = Available (không có prereq)');
assert(r.classified.D.status === 'locked', 'D = Locked (chờ C)');
assert(
  JSON.stringify(r.classified.D.unmetPrereqs) === JSON.stringify(['C']),
  'D.unmetPrereqs = [C] (KHÔNG nhắc B vì B đã exempt)',
);

const order = r.toLearnInOrder.map((n) => n.id).join(',');
assert(order === 'A,C,D', `Topo order: A,C,D (got: ${order})`);
assert(r.exempted.length === 1, 'exempted = 1');
assert(r.prunedPercent === 25, `prunedPercent = 25% (got: ${r.prunedPercent}%)`);

console.log('\n=== Edge cases ===\n');

// 1. Empty passed
const r1 = prune(nodes, edges, new Set());
assert(r1.exempted.length === 0, 'Empty passed: 0 exempt');
assert(r1.toLearnInOrder.length === 4, 'Empty passed: 4 to learn');
assert(
  r1.toLearnInOrder.map((n) => n.id).join(',') === 'A,C,B,D',
  'Empty passed: topo order A,C,B,D',
);

// 2. All passed
const r2 = prune(nodes, edges, new Set(['A', 'B', 'C', 'D']));
assert(r2.exempted.length === 4, 'All passed: 4 exempt');
assert(r2.toLearnInOrder.length === 0, 'All passed: 0 to learn');
assert(r2.prunedPercent === 100, 'All passed: 100% pruned');

// 3. Cycle detection
console.log('\n=== Cycle detection ===\n');
const cycleEdges = [
  { fromId: 'A', toId: 'B' },
  { fromId: 'B', toId: 'C' },
  { fromId: 'C', toId: 'A' },
];
try {
  prune(nodes.slice(0, 3), cycleEdges, new Set());
  console.error('✗ FAIL: cycle should throw');
  process.exit(1);
} catch (e) {
  console.log('✓ Cycle detected and threw error');
}

console.log('\n✓ ALL TESTS PASS\n');
