'use strict';

const PROBLEMS = [
  {
    slug: 'consistent-hashing-py',
    title: 'Triển khai Consistent Hashing',
    difficulty: 'hard',
    category: 'System Design',
    language: 'python',
    tags: ['hashing', 'distributed-systems', 'data-structures'],
    problemStatement: `Trong các hệ thống phân tán, việc phân bổ dữ liệu đều lên các server (nodes) là rất quan trọng. Thuật toán modulo thông thường (hash(key) % N) sẽ gặp vấn đề lớn (re-hashing) khi thêm hoặc bớt server.

Nhiệm vụ của bạn: Cài đặt class ConsistentHash hỗ trợ các thao tác:
- add_node(node_name): Thêm server mới vào vòng (Ring).
- remove_node(node_name): Xóa server khỏi vòng.
- get_node(key): Trả về tên server lưu trữ key.

Ràng buộc:
- Số lượng virtual nodes mặc định là 100.
- get_node phải có độ phức tạp O(log N) (gợi ý: dùng bisect).`,
    starterCode: `import hashlib
import bisect


class ConsistentHash:
    def __init__(self, replicas: int = 100):
        # Số lượng virtual nodes
        self.replicas = replicas
        self.hash_ring: dict[int, str] = {}
        self.sorted_keys: list[int] = []

    def _hash(self, key: str) -> int:
        return int(hashlib.md5(key.encode()).hexdigest(), 16)

    def add_node(self, node: str) -> None:
        # TODO: thêm 'replicas' virtual node vào ring + duy trì sorted_keys
        pass

    def remove_node(self, node: str) -> None:
        # TODO: xóa virtual node của 'node' khỏi ring
        pass

    def get_node(self, key: str) -> str | None:
        # TODO: dùng bisect để tìm node gần nhất theo chiều kim đồng hồ
        return None
`,
    testCases: [
      {
        description: 'Một node duy nhất — mọi key đều trỏ về nó',
        input: `ch = ConsistentHash()
ch.add_node("DB_Master_1")
print(ch.get_node("user_id_456"))`,
        expectedOutput: 'DB_Master_1',
      },
      {
        description: 'Hai node — key phải map về một trong hai',
        input: `ch = ConsistentHash()
ch.add_node("Server_A")
ch.add_node("Server_B")
n = ch.get_node("session_42")
print(n in ("Server_A", "Server_B"))`,
        expectedOutput: 'True',
      },
      {
        description: 'Sau khi remove, get_node không được trả về node đã xóa',
        input: `ch = ConsistentHash()
ch.add_node("Server_A")
ch.add_node("Server_B")
ch.remove_node("Server_A")
print(ch.get_node("anything") == "Server_B")`,
        expectedOutput: 'True',
      },
    ],
  },
  {
    slug: 'fizzbuzz-py',
    title: 'FizzBuzz cổ điển',
    difficulty: 'easy',
    category: 'Warm-up',
    language: 'python',
    tags: ['loops', 'conditionals', 'beginner'],
    problemStatement: `Viết hàm fizzbuzz(n) trả về list[str] chứa kết quả từ 1 đến n theo luật:
- Nếu số chia hết cho cả 3 và 5 → "FizzBuzz"
- Nếu chia hết cho 3 → "Fizz"
- Nếu chia hết cho 5 → "Buzz"
- Còn lại → chuỗi của chính số đó (vd "1", "2", ...)

Ràng buộc: 1 <= n <= 100.`,
    starterCode: `def fizzbuzz(n: int) -> list[str]:
    # TODO: trả về danh sách kết quả từ 1..n
    result = []
    for i in range(1, n + 1):
        pass
    return result
`,
    testCases: [
      {
        description: 'n = 5',
        input: `print(fizzbuzz(5))`,
        expectedOutput: `['1', '2', 'Fizz', '4', 'Buzz']`,
      },
      {
        description: 'n = 15 — phải có FizzBuzz ở vị trí cuối',
        input: `print(fizzbuzz(15)[-1])`,
        expectedOutput: 'FizzBuzz',
      },
      {
        description: 'n = 1',
        input: `print(fizzbuzz(1))`,
        expectedOutput: `['1']`,
      },
    ],
  },
  {
    slug: 'two-sum-py',
    title: 'Two Sum (HashMap)',
    difficulty: 'medium',
    category: 'Algorithms',
    language: 'python',
    tags: ['hashmap', 'arrays', 'two-pointer'],
    problemStatement: `Cho danh sách số nguyên nums và số target. Trả về tuple (i, j) (i < j) sao cho nums[i] + nums[j] == target. Đảm bảo input luôn có đúng một đáp án.

Yêu cầu: độ phức tạp O(n) — dùng hash map (dict) để lookup.

Nếu không tìm thấy thì trả về None.`,
    starterCode: `def two_sum(nums: list[int], target: int) -> tuple[int, int] | None:
    # TODO: duyệt 1 lần, dùng dict để lưu giá trị đã thấy
    seen: dict[int, int] = {}
    for i, x in enumerate(nums):
        pass
    return None
`,
    testCases: [
      {
        description: 'Đáp án ở đầu mảng',
        input: `print(two_sum([2, 7, 11, 15], 9))`,
        expectedOutput: '(0, 1)',
      },
      {
        description: 'Đáp án ở giữa mảng',
        input: `print(two_sum([3, 2, 4], 6))`,
        expectedOutput: '(1, 2)',
      },
      {
        description: 'Số âm',
        input: `print(two_sum([-3, 4, 3, 90], 0))`,
        expectedOutput: '(0, 2)',
      },
    ],
  },
  {
    slug: 'reverse-linked-list-py',
    title: 'Đảo ngược Linked List',
    difficulty: 'medium',
    category: 'Data Structures',
    language: 'python',
    tags: ['linked-list', 'pointers', 'recursion'],
    problemStatement: `Cho đầu (head) của một singly linked list. Đảo ngược list và trả về head mới.

Class Node đã được khai báo sẵn. Viết hàm reverse(head: Node | None) -> Node | None.

Ràng buộc: làm in-place — không tạo node mới, chỉ đổi pointer next.`,
    starterCode: `class Node:
    def __init__(self, val: int, nxt: 'Node | None' = None):
        self.val = val
        self.next = nxt


def reverse(head: Node | None) -> Node | None:
    # TODO: duyệt list, đảo pointer next của mỗi node
    prev = None
    cur = head
    return prev


def to_list(head: Node | None) -> list[int]:
    out: list[int] = []
    while head is not None:
        out.append(head.val)
        head = head.next
    return out


def from_list(values: list[int]) -> Node | None:
    head: Node | None = None
    for v in reversed(values):
        head = Node(v, head)
    return head
`,
    testCases: [
      {
        description: 'List 5 phần tử',
        input: `print(to_list(reverse(from_list([1, 2, 3, 4, 5]))))`,
        expectedOutput: '[5, 4, 3, 2, 1]',
      },
      {
        description: 'List rỗng',
        input: `print(to_list(reverse(from_list([]))))`,
        expectedOutput: '[]',
      },
      {
        description: 'List 1 phần tử',
        input: `print(to_list(reverse(from_list([42]))))`,
        expectedOutput: '[42]',
      },
    ],
  },
  {
    slug: 'debounce-js',
    title: 'Implement debounce()',
    difficulty: 'medium',
    category: 'JavaScript',
    language: 'javascript',
    tags: ['closures', 'timers', 'higher-order-functions'],
    problemStatement: `Viết hàm debounce(fn, waitMs) trả về một hàm mới sao cho:
- Mỗi lần hàm mới được gọi, đặt lại bộ đếm waitMs.
- Chỉ khi không có lời gọi nào trong waitMs liên tiếp, fn mới được thực thi với arguments cuối cùng.

Đây là pattern hay dùng cho input search (tránh gọi API mỗi keystroke).`,
    starterCode: `/**
 * @param {Function} fn
 * @param {number} waitMs
 * @returns {Function}
 */
function debounce(fn, waitMs) {
  let timer = null;
  return function (...args) {
    // TODO: clear timer cũ, set timer mới, gọi fn sau waitMs
  };
}

module.exports = { debounce };
`,
    testCases: [
      {
        description: 'Gọi 3 lần liên tục — chỉ chạy 1 lần với args cuối',
        input: `const { debounce } = require('./solution');
let calls = [];
const f = debounce((x) => calls.push(x), 50);
f(1); f(2); f(3);
setTimeout(() => console.log(JSON.stringify(calls)), 100);`,
        expectedOutput: '[3]',
      },
      {
        description: 'Gọi cách nhau dài hơn waitMs — chạy nhiều lần',
        input: `const { debounce } = require('./solution');
let calls = [];
const f = debounce((x) => calls.push(x), 30);
f('a');
setTimeout(() => f('b'), 80);
setTimeout(() => console.log(JSON.stringify(calls)), 200);`,
        expectedOutput: '["a","b"]',
      },
    ],
  },
];

async function seedCodeLabProblems({ prisma }) {
  console.log('Seeding code lab problems...');

  let created = 0;
  let updated = 0;

  for (const problem of PROBLEMS) {
    const existing = await prisma.codeLabProblem.findUnique({
      where: { slug: problem.slug },
    });

    const data = {
      title: problem.title,
      difficulty: problem.difficulty,
      category: problem.category,
      language: problem.language,
      problemStatement: problem.problemStatement,
      starterCode: problem.starterCode,
      testCases: problem.testCases,
      tags: problem.tags ?? [],
      isPublished: true,
    };

    if (existing) {
      await prisma.codeLabProblem.update({
        where: { slug: problem.slug },
        data,
      });
      updated += 1;
    } else {
      await prisma.codeLabProblem.create({
        data: { slug: problem.slug, ...data },
      });
      created += 1;
    }
  }

  console.log(
    `  Code lab problems: ${created} created, ${updated} updated (${PROBLEMS.length} total)`,
  );
  return { created, updated, total: PROBLEMS.length };
}

module.exports = { seedCodeLabProblems };
