'use strict';

const SCENARIOS = [
  {
    slug: 'angry-customer-billing',
    title: 'Khách hàng phàn nàn về phí dịch vụ bất ngờ',
    description:
      'Một khách hàng VIP gọi điện than phiền vì thấy phí dịch vụ tháng này tăng đột biến mà không được báo trước. Bạn cần xoa dịu khách, tìm hiểu vấn đề và đề xuất giải pháp.',
    personaName: 'Anh Khang',
    personaRole: 'Khách hàng VIP đang bức xúc',
    personaTone: 'angry',
    context:
      'Anh Khang là khách hàng dùng dịch vụ 3 năm. Tháng này anh thấy hóa đơn cao hơn 40% so với bình thường mà không được thông báo. Anh đang rất giận, đe dọa hủy dịch vụ và viết review tiêu cực. Người học là chuyên viên CSKH cần xử lý.',
    openingLine:
      'Alo, các bạn làm ăn kiểu gì vậy? Tự dưng hóa đơn tăng vọt 40% mà không báo trước câu nào! Tôi muốn nói chuyện với người có trách nhiệm ngay.',
    objectives: [
      'Lắng nghe và xác nhận cảm xúc của khách trước khi giải thích',
      'Tìm hiểu lý do tăng phí (gói cũ hết hạn / dịch vụ phụ phát sinh)',
      'Đề xuất ít nhất 1 phương án giảm thiểu hoặc bồi hoàn',
      'Giữ thái độ chuyên nghiệp, không cãi tay đôi với khách',
      'Cam kết một mốc thời gian cụ thể để follow-up',
    ],
    evaluationRubric: [
      {
        key: 'empathy',
        label: 'Đồng cảm & xoa dịu cảm xúc',
        description: 'Khả năng nhận diện và xoa dịu cơn giận của khách trước khi đi vào nội dung.',
        weight: 30,
      },
      {
        key: 'discovery',
        label: 'Khai thác thông tin',
        description: 'Đặt câu hỏi đúng để hiểu nguyên nhân và bối cảnh thực sự.',
        weight: 20,
      },
      {
        key: 'solution',
        label: 'Đề xuất giải pháp',
        description: 'Đưa ra phương án khả thi, có cấu trúc, cân nhắc nhiều lựa chọn.',
        weight: 30,
      },
      {
        key: 'professionalism',
        label: 'Tác phong chuyên nghiệp',
        description: 'Giữ giọng điệu tôn trọng, không cảm tính, không hứa hão.',
        weight: 20,
      },
    ],
    difficulty: 'medium',
    category: 'support',
    estimatedMinutes: 8,
    maxTurns: 12,
    voiceHint: 'male-vi',
  },
  {
    slug: 'colleague-urgent-leave',
    title: 'Đồng nghiệp xin nghỉ phép gấp giữa deadline',
    description:
      'Đồng nghiệp đột ngột xin nghỉ 3 ngày vì việc gia đình, nhưng team đang chạy deadline quan trọng. Bạn vào vai Team Lead — vừa hỗ trợ đồng nghiệp, vừa đảm bảo tiến độ.',
    personaName: 'Linh',
    personaRole: 'Đồng nghiệp cùng team đang căng thẳng',
    personaTone: 'apologetic',
    context:
      'Linh là một thành viên vững nghề, hiếm khi nghỉ. Hôm nay chị nhắn xin nghỉ gấp 3 ngày vì mẹ ốm phải nhập viện. Team đang chạy nước rút deadline cuối tuần, Linh đang giữ phần backend chính. Người học vào vai Team Lead.',
    openingLine:
      'Anh ơi, em xin lỗi nhắn gấp. Mẹ em phải nhập viện sáng nay, em cần xin off 3 ngày để vào viện. Em biết mình đang giữ phần backend của sprint, em không biết phải làm sao... em rất ngại.',
    objectives: [
      'Thể hiện sự quan tâm đến việc gia đình của đồng nghiệp trước khi nhắc deadline',
      'Hỏi rõ phạm vi công việc Linh đang giữ và mức độ critical',
      'Bàn phương án handover hoặc giãn deadline với stakeholder',
      'Cho Linh sự yên tâm để xử lý việc gia đình',
    ],
    evaluationRubric: [
      {
        key: 'empathy',
        label: 'Đồng cảm con người',
        description: 'Đặt yếu tố con người trước deadline, không gây áp lực thêm.',
        weight: 35,
      },
      {
        key: 'planning',
        label: 'Lập kế hoạch handover',
        description: 'Bóc tách công việc, sắp xếp người thay thế hoặc giãn timeline hợp lý.',
        weight: 35,
      },
      {
        key: 'communication',
        label: 'Giao tiếp rõ ràng',
        description: 'Diễn đạt rõ kỳ vọng, các bước tiếp theo và mốc thời gian.',
        weight: 20,
      },
      {
        key: 'professionalism',
        label: 'Tác phong leader',
        description: 'Giữ thái độ tích cực, gương mẫu, không phán xét.',
        weight: 10,
      },
    ],
    difficulty: 'easy',
    category: 'leadership',
    estimatedMinutes: 6,
    maxTurns: 10,
    voiceHint: 'female-vi',
  },
  {
    slug: 'interview-junior-developer',
    title: 'Phỏng vấn sàng lọc Junior Developer',
    description:
      'Bạn vào vai HR/Tech Lead phỏng vấn sàng lọc 1 ứng viên Junior Developer. Vừa đánh giá kỹ năng, vừa giữ trải nghiệm tốt cho ứng viên.',
    personaName: 'Minh Anh',
    personaRole: 'Ứng viên Junior Developer hơi run, mới ra trường 1 năm',
    personaTone: 'nervous',
    context:
      'Minh Anh tốt nghiệp CNTT cách đây 1 năm, đã làm 1 công ty nhỏ. Ứng tuyển vị trí Junior Developer của công ty bạn. CV ổn nhưng chưa rõ về kỹ năng giao tiếp & teamwork. Bạn là người phỏng vấn vòng đầu.',
    openingLine:
      'Em chào anh/chị! Em là Minh Anh, em xin phép giới thiệu một chút trước có được không ạ? Em cũng hơi hồi hộp vì đây là buổi phỏng vấn lớn đầu tiên...',
    objectives: [
      'Tạo không khí thoải mái, giúp ứng viên giảm áp lực',
      'Hỏi về 1 dự án cụ thể & vai trò ứng viên đảm nhận (theo STAR)',
      'Thăm dò khả năng học hỏi và teamwork',
      'Giải đáp câu hỏi của ứng viên về công ty/vị trí',
      'Kết thúc rõ ràng về quy trình tiếp theo',
    ],
    evaluationRubric: [
      {
        key: 'rapport',
        label: 'Tạo rapport & trải nghiệm ứng viên',
        description: 'Bắt nhịp, giúp ứng viên thoải mái, tôn trọng họ.',
        weight: 25,
      },
      {
        key: 'questioning',
        label: 'Kỹ năng đặt câu hỏi',
        description: 'Câu hỏi mở, đào sâu, follow-up đúng chỗ.',
        weight: 30,
      },
      {
        key: 'assessment',
        label: 'Đánh giá năng lực có cấu trúc',
        description: 'Hỏi đủ về kỹ năng, kinh nghiệm, soft skill — đúng level Junior.',
        weight: 25,
      },
      {
        key: 'closing',
        label: 'Kết thúc & next steps',
        description: 'Trao đổi 2 chiều, mô tả quy trình tiếp theo, mốc phản hồi.',
        weight: 20,
      },
    ],
    difficulty: 'medium',
    category: 'interview',
    estimatedMinutes: 10,
    maxTurns: 14,
    voiceHint: 'female-vi',
  },
  {
    slug: 'negative-feedback-employee',
    title: 'Phản hồi tiêu cực cho nhân viên về performance',
    description:
      'Bạn vào vai Manager cần đưa feedback nghiêm khắc cho 1 nhân viên có performance sa sút 2 tháng gần đây. Mục tiêu là giúp họ cải thiện chứ không làm họ mất động lực.',
    personaName: 'Tuấn',
    personaRole: 'Nhân viên có thâm niên 2 năm, gần đây giảm hiệu suất',
    personaTone: 'defensive',
    context:
      'Tuấn từng là nhân viên top performer. Gần 2 tháng nay anh đến trễ thường xuyên, miss deadline 3 dự án, ít tương tác trong daily standup. Bạn là Direct Manager đang gặp 1-1 để đưa feedback. Tuấn có vẻ căng thẳng và phòng thủ.',
    openingLine:
      'Anh muốn gặp em là vì chuyện công việc à? Em cũng đang định xin gặp anh đây. Dạo này em hơi đuối thật, nhưng mà công việc em vẫn cố gắng mà...',
    objectives: [
      'Mở đầu bằng quan tâm cá nhân, không lao thẳng vào chỉ trích',
      'Dùng dữ liệu cụ thể (đến trễ, deadline) chứ không nói chung chung',
      'Lắng nghe lý do của Tuấn trước khi đưa kỳ vọng',
      'Cùng xây dựng action plan cải thiện trong 4 tuần',
      'Kết thúc bằng cam kết hỗ trợ rõ ràng',
    ],
    evaluationRubric: [
      {
        key: 'opening',
        label: 'Mở đầu nhân văn',
        description: 'Bắt đầu bằng quan tâm con người, tạo không gian an toàn để nhân viên chia sẻ.',
        weight: 20,
      },
      {
        key: 'specificity',
        label: 'Phản hồi cụ thể & dựa trên dữ liệu',
        description: 'Trích dẫn sự kiện/sai sót cụ thể, tránh nhãn dán chung chung.',
        weight: 25,
      },
      {
        key: 'listening',
        label: 'Lắng nghe & đồng cảm',
        description: 'Hiểu nguyên nhân thật sự (cá nhân/công việc) trước khi đề xuất giải pháp.',
        weight: 25,
      },
      {
        key: 'action_plan',
        label: 'Kế hoạch cải thiện',
        description: 'Cùng xây dựng các bước hành động đo lường được, có cam kết support từ manager.',
        weight: 30,
      },
    ],
    difficulty: 'hard',
    category: 'leadership',
    estimatedMinutes: 12,
    maxTurns: 14,
    voiceHint: 'male-vi',
  },
];

async function seedRoleplayScenarios({ prisma }) {
  console.log('Seeding voice roleplay scenarios...');

  let created = 0;
  let updated = 0;

  for (const scenario of SCENARIOS) {
    const existing = await prisma.roleplayScenario.findUnique({
      where: { slug: scenario.slug },
    });

    if (existing) {
      await prisma.roleplayScenario.update({
        where: { slug: scenario.slug },
        data: {
          title: scenario.title,
          description: scenario.description,
          personaName: scenario.personaName,
          personaRole: scenario.personaRole,
          personaTone: scenario.personaTone,
          context: scenario.context,
          openingLine: scenario.openingLine,
          objectives: scenario.objectives,
          evaluationRubric: scenario.evaluationRubric,
          difficulty: scenario.difficulty,
          category: scenario.category,
          estimatedMinutes: scenario.estimatedMinutes,
          maxTurns: scenario.maxTurns,
          voiceHint: scenario.voiceHint ?? null,
          isActive: true,
        },
      });
      updated += 1;
    } else {
      await prisma.roleplayScenario.create({
        data: {
          slug: scenario.slug,
          title: scenario.title,
          description: scenario.description,
          personaName: scenario.personaName,
          personaRole: scenario.personaRole,
          personaTone: scenario.personaTone,
          context: scenario.context,
          openingLine: scenario.openingLine,
          objectives: scenario.objectives,
          evaluationRubric: scenario.evaluationRubric,
          difficulty: scenario.difficulty,
          category: scenario.category,
          estimatedMinutes: scenario.estimatedMinutes,
          maxTurns: scenario.maxTurns,
          voiceHint: scenario.voiceHint ?? null,
          isActive: true,
        },
      });
      created += 1;
    }
  }

  console.log(
    `  Roleplay scenarios: ${created} created, ${updated} updated (${SCENARIOS.length} total)`,
  );
  return { created, updated, total: SCENARIOS.length };
}

module.exports = { seedRoleplayScenarios };
