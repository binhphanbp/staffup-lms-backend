// Module 1 — Lộ trình Học tập Thích ứng
// 50 bài onboarding curated + ~75 edges + 3 demo passed-set cho student1/2/3.

const NODES = [
  // ─── Nhóm A — Văn hóa Công ty ───
  ['L01', 'Giới thiệu Công ty & Lịch sử', 'company', 2, 'Tổng quan lịch sử thành lập, các giai đoạn phát triển và dấu mốc quan trọng của công ty.'],
  ['L02', 'Tầm nhìn, Sứ mệnh & Giá trị Cốt lõi', 'company', 2, 'Hiểu rõ định hướng dài hạn, sứ mệnh phục vụ khách hàng và 5 giá trị cốt lõi của tổ chức.'],
  ['L03', 'Cơ cấu Tổ chức & Phòng ban', 'company', 1, 'Sơ đồ tổ chức, vai trò các phòng ban và quan hệ phối hợp.'],
  ['L04', 'Quy trình Onboarding Tuần 1', 'company', 2, 'Lộ trình hội nhập 5 ngày đầu tiên, người liên hệ và checklist hoàn thành.'],
  ['L05', 'Sổ tay Nhân viên', 'company', 3, 'Hướng dẫn toàn diện về quyền lợi, nghĩa vụ và quy định nội bộ.'],
  ['L06', 'Chính sách Nhân sự & Phúc lợi', 'company', 2, 'Lương thưởng, bảo hiểm, các chương trình phúc lợi và quy định liên quan.'],
  ['L07', 'Quy trình Xin nghỉ phép & Công tác', 'company', 1, 'Cách làm đơn nghỉ phép, công tác và phê duyệt qua hệ thống nội bộ.'],
  ['L08', 'Hệ thống Email & Slack Nội bộ', 'company', 1, 'Hướng dẫn sử dụng email công ty và Slack cho giao tiếp nội bộ hiệu quả.'],
  ['L09', 'Hệ thống Quản lý Công việc (Jira)', 'company', 2, 'Tạo task, assign, theo dõi tiến độ và làm báo cáo qua Jira.'],
  ['L10', 'Đánh giá Hiệu suất & KPI', 'company', 2, 'Phương pháp đánh giá KPI hàng quý, OKR cá nhân và lộ trình phát triển.'],

  // ─── Nhóm B — Kỹ năng mềm ───
  ['L11', 'Giao tiếp Cơ bản', 'soft_skills', 3, 'Kỹ năng giao tiếp lời nói và phi-lời nói trong môi trường công sở chuyên nghiệp.'],
  ['L12', 'Lắng nghe Tích cực', 'soft_skills', 2, 'Kỹ năng lắng nghe chủ động, đặt câu hỏi và phản hồi để hiểu đúng đối tác.'],
  ['L13', 'Email Chuyên nghiệp', 'soft_skills', 2, 'Cấu trúc email công việc, ngữ điệu phù hợp và tránh các lỗi giao tiếp phổ biến.'],
  ['L14', 'Thuyết trình Hiệu quả', 'soft_skills', 3, 'Kỹ năng xây dựng slide, kể chuyện và xử lý câu hỏi từ khán giả.'],
  ['L15', 'Quản lý Thời gian', 'soft_skills', 2, 'Kỹ thuật ưu tiên việc, Pomodoro, time-blocking và xử lý interrupt hiệu quả.'],
  ['L16', 'Làm việc Nhóm', 'soft_skills', 3, 'Vai trò trong team, cách phối hợp đa chức năng và xây dựng niềm tin đồng nghiệp.'],
  ['L17', 'Giải quyết Mâu thuẫn', 'soft_skills', 3, 'Kỹ năng nhận diện, giảm leo thang và đưa ra giải pháp đôi bên cùng có lợi.'],
  ['L18', 'Phản hồi Mang tính Xây dựng', 'soft_skills', 2, 'Mô hình SBI, phản hồi 1-1 hiệu quả và tiếp nhận feedback từ cấp trên.'],
  ['L19', 'Đàm phán Cơ bản', 'soft_skills', 3, 'Chuẩn bị, mở thoại, BATNA và đạt được kết quả win-win trong đàm phán nội bộ.'],
  ['L20', 'Xử lý Khủng hoảng', 'soft_skills', 4, 'Kỹ năng xử lý tình huống căng thẳng, khách hàng phản ứng tiêu cực và sự cố nội bộ.'],

  // ─── Nhóm C — Nghiệp vụ Chuyên môn ───
  ['L21', 'Quy trình Phục vụ Khách hàng', 'professional', 3, 'Chuẩn mực phục vụ khách hàng, quy trình tiếp nhận và xử lý yêu cầu cơ bản.'],
  ['L22', 'Tiếp nhận & Phân loại Yêu cầu', 'professional', 2, 'Phân loại request theo SLA, ưu tiên và chuyển tiếp đúng người chịu trách nhiệm.'],
  ['L23', 'Tra cứu Hệ thống CRM', 'professional', 2, 'Tìm kiếm thông tin khách hàng, lịch sử tương tác và tạo ticket trên CRM.'],
  ['L24', 'Xử lý Khiếu nại Cấp 1', 'professional', 3, 'Quy trình tiếp nhận khiếu nại, xác minh thông tin và đưa ra phương án xử lý ban đầu.'],
  ['L25', 'Quy trình Hoàn tiền & Đổi trả', 'professional', 2, 'Điều kiện hoàn tiền, quy trình kiểm tra và phối hợp với phòng kế toán.'],
  ['L26', 'Báo cáo Tuần & Tháng', 'professional', 2, 'Cấu trúc báo cáo, thu thập số liệu và trình bày insights cho cấp quản lý.'],
  ['L27', 'Phối hợp Liên Phòng ban', 'professional', 2, 'Quy trình raise ticket cross-team, escalation matrix và best-practice cộng tác.'],
  ['L28', 'Phân tích Dữ liệu Khách hàng', 'professional', 4, 'Khai thác CRM data, segmentation, NPS và đề xuất action từ insights.'],
  ['L29', 'Đề xuất Cải tiến Quy trình', 'professional', 3, 'Phát hiện bottleneck, viết business case và pitch ý tưởng cải tiến cho leadership.'],
  ['L30', 'Khách hàng VIP & Trường hợp Đặc biệt', 'professional', 3, 'Quy trình white-glove, đặc quyền VIP và xử lý ngoại lệ ngoài SLA.'],

  // ─── Nhóm D — Tuân thủ & An toàn ───
  ['L31', 'Bảo mật Thông tin Cá nhân (PII)', 'compliance', 2, 'Khái niệm PII, quy định Việt Nam và cách xử lý dữ liệu nhân viên/khách hàng.'],
  ['L32', 'Quy định An toàn Thông tin', 'compliance', 2, 'Mật khẩu mạnh, MFA, tránh phishing và quy tắc dùng thiết bị cá nhân.'],
  ['L33', 'Phòng chống Phishing', 'compliance', 2, 'Nhận diện email lừa đảo, tránh click link độc và quy trình báo cáo sự cố.'],
  ['L34', 'Bảo vệ Dữ liệu Khách hàng', 'compliance', 3, 'GDPR-VN, đồng ý xử lý dữ liệu, thời hạn lưu và quyền của chủ thể dữ liệu.'],
  ['L35', 'An toàn Lao động & PCCC', 'compliance', 2, 'Quy định ATVSLĐ, quy trình PCCC tòa nhà và sơ tán an toàn.'],
  ['L36', 'Đạo đức Nghề nghiệp & Quy tắc Ứng xử', 'compliance', 2, 'Bộ quy tắc ứng xử, tránh xung đột lợi ích và quan hệ với đối tác.'],
  ['L37', 'Phòng chống Tham nhũng & Hối lộ', 'compliance', 2, 'Quà tặng, giao tiếp với cơ quan nhà nước và quy trình duyệt chi tiêu nhạy cảm.'],
  ['L38', 'Báo cáo Vi phạm Nội bộ (Whistleblow)', 'compliance', 1, 'Kênh báo cáo ẩn danh, bảo vệ người tố giác và quy trình điều tra nội bộ.'],
  ['L39', 'Quy định về Sở hữu Trí tuệ', 'compliance', 2, 'Bản quyền, sáng chế, IP công ty và sử dụng tài sản trí tuệ của bên thứ ba.'],
  ['L40', 'Quản lý Tài liệu Mật', 'compliance', 2, 'Phân loại tài liệu, quyền truy cập và quy trình tiêu hủy thông tin nhạy cảm.'],

  // ─── Nhóm E — Lãnh đạo & Quản lý ───
  ['L41', 'Tự Lãnh đạo & Phát triển Bản thân', 'leadership', 3, 'Mindset growth, mục tiêu cá nhân và xây dựng habit cải thiện liên tục.'],
  ['L42', 'Coaching Cơ bản', 'leadership', 3, 'Mô hình GROW, đặt câu hỏi mở và hỗ trợ đồng nghiệp tự tìm giải pháp.'],
  ['L43', 'Mentoring Đồng nghiệp Mới', 'leadership', 3, 'Vai trò mentor onboarding, lập plan 30/60/90 ngày và giao tiếp định kỳ.'],
  ['L44', 'Đặt Mục tiêu OKR', 'leadership', 3, 'Khung OKR theo quý, alignment top-down và measurement key results.'],
  ['L45', 'Quản lý Hiệu suất Nhóm Nhỏ', 'leadership', 4, 'Theo dõi tiến độ, 1-1 hiệu quả và xử lý underperformance một cách tôn trọng.'],
  ['L46', 'Tuyển dụng & Phỏng vấn', 'leadership', 3, 'Cấu trúc interview, đánh giá behavior-based và tránh bias trong tuyển dụng.'],
  ['L47', 'Ra Quyết định Dựa trên Dữ liệu', 'leadership', 4, 'Khung phân tích, A/B testing và cân bằng giữa data và intuition.'],
  ['L48', 'Quản lý Thay đổi (Change Mgmt)', 'leadership', 3, 'Mô hình ADKAR, communication plan và xử lý kháng cự trong tổ chức.'],
  ['L49', 'Lãnh đạo trong Khủng hoảng', 'leadership', 4, 'Ra quyết định trong áp lực, communication minh bạch và phục hồi tinh thần đội.'],
  ['L50', 'Phát triển Văn hóa Đội nhóm', 'leadership', 4, 'Xây dựng giá trị nhóm, nghi thức (rituals) và đo lường engagement hàng quý.'],
];

const EDGES = [
  // Nhóm A
  ['L01', 'L02'], ['L01', 'L03'], ['L01', 'L04'],
  ['L02', 'L05'], ['L03', 'L05'],
  ['L05', 'L06'], ['L06', 'L07'],
  ['L04', 'L08'], ['L08', 'L09'],
  ['L05', 'L10'], ['L06', 'L10'],

  // Nhóm B
  ['L11', 'L12'], ['L11', 'L13'], ['L11', 'L14'],
  ['L11', 'L16'], ['L15', 'L16'],
  ['L12', 'L17'], ['L16', 'L17'],
  ['L12', 'L18'],
  ['L11', 'L19'], ['L17', 'L19'],
  ['L12', 'L20'], ['L17', 'L20'],

  // Nhóm C — cross-cluster (cần A + B)
  ['L11', 'L21'], ['L05', 'L21'],
  ['L21', 'L22'],
  ['L09', 'L23'], ['L22', 'L23'],
  ['L20', 'L24'], ['L22', 'L24'],
  ['L24', 'L25'], ['L06', 'L25'],
  ['L09', 'L26'], ['L18', 'L26'],
  ['L16', 'L27'], ['L26', 'L27'],
  ['L23', 'L28'],
  ['L26', 'L29'], ['L28', 'L29'],
  ['L24', 'L30'], ['L25', 'L30'],

  // Nhóm D
  ['L05', 'L31'],
  ['L31', 'L32'], ['L08', 'L32'],
  ['L32', 'L33'],
  ['L31', 'L34'], ['L23', 'L34'],
  ['L01', 'L35'],
  ['L02', 'L36'], ['L05', 'L36'],
  ['L36', 'L37'],
  ['L36', 'L38'], ['L37', 'L38'],
  ['L05', 'L39'],
  ['L31', 'L40'], ['L39', 'L40'],

  // Nhóm E
  ['L15', 'L41'], ['L18', 'L41'],
  ['L18', 'L42'], ['L41', 'L42'],
  ['L42', 'L43'], ['L21', 'L43'],
  ['L10', 'L44'], ['L41', 'L44'],
  ['L44', 'L45'], ['L16', 'L45'],
  ['L11', 'L46'], ['L36', 'L46'],
  ['L28', 'L47'], ['L44', 'L47'],
  ['L20', 'L48'], ['L45', 'L48'],
  ['L20', 'L49'], ['L45', 'L49'], ['L47', 'L49'],
  ['L02', 'L50'], ['L45', 'L50'], ['L48', 'L50'],
];

// Demo passed sets — match đúng test scenario bắt buộc
const DEMO_PASSED = {
  'student1@staffup.local': ['L11'],                                      // Test scenario bắt buộc: chỉ pass L11 (Giao tiếp)
  'student2@staffup.local': ['L11', 'L12', 'L15', 'L16', 'L18', 'L21', 'L26'], // Senior CS
  'student3@staffup.local': [],                                           // Empty — chưa pass gì
};

async function seedLearningPath(prisma, logger = console) {
  // 1. Nodes — upsert idempotent
  for (const [id, title, category, hours, description] of NODES) {
    await prisma.curriculumNode.upsert({
      where: { id },
      update: { title, category, estimatedHours: hours, description },
      create: { id, title, category, estimatedHours: hours, description },
    });
  }
  logger.info(`[learning-path] upserted ${NODES.length} curriculum nodes`);

  // 2. Edges — skip if exists (composite unique)
  let edgesCreated = 0;
  for (const [fromId, toId] of EDGES) {
    const exists = await prisma.curriculumEdge.findUnique({
      where: { fromId_toId: { fromId, toId } },
    });
    if (!exists) {
      await prisma.curriculumEdge.create({ data: { fromId, toId } });
      edgesCreated++;
    }
  }
  logger.info(`[learning-path] created ${edgesCreated} new edges (total target: ${EDGES.length})`);

  // 3. Demo passed sets per student
  let testResultsCreated = 0;
  for (const [email, nodeIds] of Object.entries(DEMO_PASSED)) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      logger.warn(`[learning-path] student ${email} not found, skipping demo passed set`);
      continue;
    }
    for (const nodeId of nodeIds) {
      const exists = await prisma.employeeSkillTestResult.findUnique({
        where: { userId_nodeId: { userId: user.id, nodeId } },
      });
      if (!exists) {
        await prisma.employeeSkillTestResult.create({
          data: { userId: user.id, nodeId, source: 'entry_test', score: 80 + Math.floor(Math.random() * 20) },
        });
        testResultsCreated++;
      }
    }
  }
  logger.info(`[learning-path] created ${testResultsCreated} demo employee_skill_test_results`);

  return {
    nodes: NODES.length,
    edges: EDGES.length,
    edgesCreated,
    testResultsCreated,
  };
}

module.exports = { seedLearningPath, NODES, EDGES, DEMO_PASSED };
