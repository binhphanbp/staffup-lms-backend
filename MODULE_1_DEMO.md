# Module 1 — Lộ trình Học tập Thích ứng (Adaptive Learning Path)

> Tích hợp vào StaffUp LMS — Topological Sort & Cố vấn AI (Gemini 2.5).
> Module 1 trong đề thi vòng chung kết hackathon N11.

---

## TL;DR

- 50 bài onboarding curated theo 5 nhóm nghiệp vụ (`L01`-`L50`), kết nối bằng ~76 cạnh prerequisite tạo thành DAG.
- Thuật toán O(V+E): `classify` (3 trạng thái không bắc cầu) + `topoSortToLearn` (Kahn's BFS, deterministic) + `prune` (cắt tỉa + thống kê).
- Cố vấn AI viết email "Chào mừng & Lộ trình cá nhân hoá" 4 đoạn, JSON output, tích hợp `/ai-configuration` (toggle `learningAdvisor` + prompt overridable).
- BGK có thể đổi data live: thêm/xoá cạnh, set passed-set demo, xem graph re-render.

---

## Cài đặt 60 giây

```bash
# 1. Backend (terminal 1)
cd staffup-lms-backend
cp .env.example .env                   # nếu chưa có
docker compose up -d                   # Postgres pgvector + API container
pnpm install
pnpm prisma:migrate                    # apply migration learning-path (đã có sẵn)
pnpm prisma:seed                       # seed 50 nodes + 76 edges + 3 demo passed-set
pnpm dev                               # http://localhost:3000/api/v1

# 2. Frontend (terminal 2)
cd ../staffup-lms-frontend
cp .env.example .env.local
pnpm install
pnpm dev                               # http://localhost:3001
```

**GEMINI_API_KEY**: thêm vào `staffup-lms-backend/.env` để bật AI sinh email. Khi thiếu key hoặc Gemini lỗi → fallback template tự build từ data, vẫn render đẹp.

---

## Login demo

| Tài khoản                | Mật khẩu      | Vai trò | Ghi chú                                                        |
| ------------------------ | ------------- | ------- | -------------------------------------------------------------- |
| `admin@staffup.local`    | `ChangeMe123` | Admin   | Truy cập đầy đủ Lộ trình + AI Config                           |
| `student1@staffup.local` | `Student123`  | Student | Đã pass `[L11]` — **test scenario bắt buộc**                   |
| `student2@staffup.local` | `Student123`  | Student | Senior CS — pass `[L11, L12, L15, L16, L18, L21, L26]` (7 bài) |
| `student3@staffup.local` | `Student123`  | Student | Empty — chưa pass bài nào                                      |

---

## Demo flow cho BGK (5 phút)

1. **Login admin** → sidebar trái → **"🎯 Lộ trình Thích ứng"** — graph 50 nodes load tự động.
2. **Chọn `student1`** từ dropdown — sidebar phải tick sẵn `L11`. Verify:
   - L11 = **xanh ✓** (Exempt)
   - L12, L13, L14, L19 = **xanh dương** (Available — prereq L11 đã exempt)
   - L20 = **xám 🔒** (Locked — chờ L17, KHÔNG nhắc L12 vì L12 chưa pass)
   - Hover L20 → tooltip "Đang chờ: L17" (test scenario Bước 2 đề thi)
3. **Click `✨ Cấp phát Lộ trình & Soạn AI`** → email render, có:
   - Subject ≤80 ký tự, kèm tên nhân viên
   - 4 đoạn (chào → công nhận `Giao tiếp Cơ bản (L11)` → tuần 1/2/3 → động viên + chữ ký L&D)
   - Highlight `% rút ngắn` cụ thể
4. **Tab `Đổi data (BGK)`** → thử thêm cạnh `L13 → L11` → API trả 400 "Cạnh tạo chu trình", toast đỏ.
5. **Switch `student2`** (Senior) → graph tô lại, % rút ngắn ~14%, email khác hẳn (công nhận L11/L12/L16/L18/L21).
6. **`/ai-configuration` → tắt toggle "Cố vấn Đào tạo (Learning Advisor)"** → quay lại graph → click "Cấp phát" → 503 "Tính năng đã được Quản trị viên tạm tắt" → bật lại → OK.

---

## Verify thuật toán (không cần DB / Gemini)

```bash
cd staffup-lms-backend
pnpm verify:learning-path
```

Output mong đợi:

```
=== Test scenario bắt buộc — Bước 2 ===
✓ B = Exempt (đã pass)
✓ A = Available (KHÔNG bắc cầu — pass B không tự suy A)
✓ C = Available (không có prereq)
✓ D = Locked (chờ C)
✓ D.unmetPrereqs = [C] (KHÔNG nhắc B vì B đã exempt)
✓ Topo order: A,C,D
✓ exempted = 1
✓ prunedPercent = 25%

=== Edge cases ===
✓ Empty passed: 0 exempt, 4 to learn, topo order A,C,B,D
✓ All passed: 4 exempt, 0 to learn, 100% pruned

=== Cycle detection ===
✓ Cycle detected and threw error

✓ ALL TESTS PASS
```

Pure algorithm tách riêng tại `src/utils/learning-path.algo.ts` để test KHÔNG cần `DATABASE_URL` hay `GEMINI_API_KEY`.

---

## API endpoints (`/api/v1/learning-path/*`)

| Method | Path              | Auth          | Body/Params                           | Response                                                                   |
| ------ | ----------------- | ------------- | ------------------------------------- | -------------------------------------------------------------------------- |
| GET    | `/graph`          | logged-in     | —                                     | `{nodes, edges}`                                                           |
| POST   | `/preview`        | logged-in     | `{userId?, passedNodeIds?: string[]}` | `{exempted, available, locked, toLearnInOrder, prunedPercent, classified}` |
| POST   | `/generate-email` | admin/manager | `{userId, employee, passedNodeIds?}`  | `{email: {subject, body, metadata}}`                                       |
| POST   | `/edges`          | admin         | `{fromId, toId}`                      | edge mới (validate cycle trước)                                            |
| DELETE | `/edges/:id`      | admin         | —                                     | `{ok: true}`                                                               |
| POST   | `/test-results`   | admin         | `{userId, nodeIds: string[]}`         | upsert                                                                     |

---

## Cấu trúc code

**Backend:**

- `src/utils/learning-path.algo.ts` — pure algorithm (classify / topoSortToLearn / prune / wouldCreateCycle), không phụ thuộc DB/AI
- `src/services/learning-path.service.ts` — DB I/O + Gemini orchestration
- `src/controllers/learning-path.controller.ts` — HTTP handlers
- `src/routes/v1/learning-path.routes.ts` — route + RBAC
- `src/schemas/learning-path.schema.ts` — Zod validation
- `prisma/migrations/20260428020000_add_learning_path/` — schema migration
- `prisma/seeds/core/learning-path.seed.js` — 50 nodes + 76 edges + 3 demo presets
- `scripts/verify-learning-path.ts` — chứng minh thuật toán đúng spec

**Frontend:**

- `src/app/(admin)/learning-path/page.tsx` — trang chính
- `src/components/admin/learning-path/` — `LearningPathGraph`, `LessonNode`, `PassedSelector`, `DataEditor`, `EmployeeSelector`, `StatsBar`, `EmailPanel`
- `src/services/learning-path.service.ts` — API client
- Sidebar item: `src/components/shared/AdminSidebar.tsx` (mục "Lộ trình Thích ứng")

**AI Config integration:**

- `src/config/gemini.config.ts` — `LEARNING_ADVISOR_SYSTEM_PROMPT` (default)
- `src/services/ai-config.service.ts` — `learningAdvisor` toggle + `learningAdvisorSystemPrompt` override field
- Admin có thể tắt toggle qua `/ai-configuration` (FE) hoặc PATCH `/admin/ai-config` (API)

---

## Quy ước nghiệp vụ cốt lõi (Q&A BGK)

| Q                                                        | A                                                                                                                                                        |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tại sao A vẫn `available` dù B đã pass và A là prereq B? | **KHÔNG bắc cầu** — bài test chỉ kiểm B, không kiểm A. Nhân viên có thể đã làm B trong job cũ nhưng chưa học A bài bản. Đáp ứng đúng spec đề thi Bước 2. |
| Sao topo order deterministic?                            | Sort alphabetical trong cùng layer Kahn's BFS — demo lặp lại được, BGK kiểm tra dễ.                                                                      |
| 10 000 node có scale không?                              | Pure algorithm O(V+E) tuyến tính. UI dùng React Flow virtualization + filter category nếu cần.                                                           |
| Email Gemini bịa lesson?                                 | System prompt cấm bịa + chỉ liệt kê id/title được cung cấp. `responseMimeType: 'application/json'` ép schema. Có fallback template khi parse fail.       |
| Admin tắt toggle?                                        | API trả 503 "Tính năng đã được Quản trị viên tạm tắt". Bật lại tức thì (cache 60s).                                                                      |
