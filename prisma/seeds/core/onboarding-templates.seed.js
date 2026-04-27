'use strict';

const TEMPLATES = [
  {
    slug: 'junior-backend-developer-90d',
    name: 'Onboarding Junior Backend Developer 30/60/90 ngày',
    description:
      'Lộ trình chuẩn cho Junior Backend Developer mới gia nhập: hội nhập team, làm chủ codebase, dẫn được task end-to-end sau 90 ngày.',
    targetPosition: 'Junior Backend Developer',
    totalDays: 90,
    isSystem: true,
    stages: [
      {
        name: '30 ngày đầu — Định hướng & Hội nhập',
        description: 'Làm quen team, công cụ, codebase và quy trình nội bộ.',
        startOffsetDays: 0,
        endOffsetDays: 30,
        tasks: [
          {
            title: 'Tham gia buổi orientation cùng HR',
            description: 'Tổng quan công ty, văn hoá, chính sách, quyền lợi nhân sự.',
            category: 'meeting',
            priority: 'high',
            estimatedHours: 2,
          },
          {
            title: 'Setup môi trường dev',
            description: 'IDE, Docker, repo BE/FE, DB local, test chạy được full stack.',
            category: 'admin',
            priority: 'high',
            estimatedHours: 4,
          },
          {
            title: '1-1 với Tech Lead về codebase',
            description: 'Tour kiến trúc tổng quan, module quan trọng, convention coding.',
            category: 'meeting',
            priority: 'high',
            estimatedHours: 2,
          },
          {
            title: 'Đọc tài liệu kiến trúc & ADR',
            description: 'Wiki nội bộ, Architecture Decision Records, sequence diagram chính.',
            category: 'learning',
            priority: 'medium',
            estimatedHours: 6,
          },
          {
            title: 'Hoàn thành khoá Internal Coding Standards',
            description: 'Linting, naming, test pyramid, code review checklist.',
            category: 'learning',
            priority: 'medium',
            estimatedHours: 4,
          },
          {
            title: 'Pick up 2 bug nhỏ (good-first-issue)',
            description: 'Vừa làm quen code vừa luyện flow PR/code review.',
            category: 'practice',
            priority: 'medium',
            estimatedHours: 8,
          },
        ],
      },
      {
        name: 'Day 31-60 — Bắt nhịp & Giao việc thật',
        description: 'Cặp với mentor, nhận task feature thật, thuyết trình design.',
        startOffsetDays: 30,
        endOffsetDays: 60,
        tasks: [
          {
            title: 'Pair-work feature đầu tiên cùng mentor',
            description: 'Feature nhỏ end-to-end: design → code → test → release.',
            category: 'practice',
            priority: 'high',
            estimatedHours: 24,
          },
          {
            title: 'Tham gia 4 buổi sync team',
            description: 'Quan sát design discussion, đặt câu hỏi nắm context dự án.',
            category: 'meeting',
            priority: 'medium',
            estimatedHours: 4,
          },
          {
            title: 'Trình bày 1 tech-share nội bộ',
            description: 'Chia sẻ 15 phút về chủ đề bạn đã học (lib mới, pattern, etc).',
            category: 'learning',
            priority: 'medium',
            estimatedHours: 4,
          },
          {
            title: 'Review giữa kỳ 1-1 với manager',
            description: 'Phản hồi 2 chiều: bạn cần gì thêm + manager đánh giá đến đâu.',
            category: 'review',
            priority: 'high',
            estimatedHours: 1,
          },
        ],
      },
      {
        name: 'Day 61-90 — Chủ động & Kết thúc onboarding',
        description: 'Dẫn dắt 1 sub-feature, đánh giá 90 ngày, lock onboarding.',
        startOffsetDays: 60,
        endOffsetDays: 90,
        tasks: [
          {
            title: 'Dẫn dắt 1 sub-feature độc lập',
            description: 'Bạn là DRI: viết design doc, estimate, code, theo dõi production.',
            category: 'practice',
            priority: 'high',
            estimatedHours: 40,
          },
          {
            title: 'Code review 5 PR đồng nghiệp',
            description: 'Tích cực tham gia code review để học context dự án.',
            category: 'practice',
            priority: 'medium',
            estimatedHours: 6,
          },
          {
            title: 'Đánh giá 90 ngày cùng manager',
            description: 'Tổng kết kết quả, đặt mục tiêu Q tiếp theo, khoá onboarding.',
            category: 'review',
            priority: 'high',
            estimatedHours: 1,
          },
        ],
      },
    ],
  },
  {
    slug: 'sales-executive-90d',
    name: 'Onboarding Sales Executive 30/60/90 ngày',
    description:
      'Lộ trình chuẩn cho Sales Executive mới: học sản phẩm, đi cùng senior, chốt deal độc lập sau 90 ngày.',
    targetPosition: 'Sales Executive',
    totalDays: 90,
    isSystem: true,
    stages: [
      {
        name: '30 ngày đầu — Học sản phẩm & văn hoá',
        description: 'Nắm sản phẩm, đối tượng khách hàng, công cụ CRM, văn hoá đội.',
        startOffsetDays: 0,
        endOffsetDays: 30,
        tasks: [
          {
            title: 'Hoàn thành khoá Product 101',
            description: 'Tính năng, lợi ích, USP của từng dòng sản phẩm/dịch vụ.',
            category: 'learning',
            priority: 'high',
            estimatedHours: 8,
          },
          {
            title: 'Học pricing & gói dịch vụ',
            description: 'Bảng giá, deal structure, biên độ chiết khấu cho phép.',
            category: 'learning',
            priority: 'high',
            estimatedHours: 4,
          },
          {
            title: 'Setup CRM, công cụ pipeline',
            description: 'Tài khoản CRM, dashboard pipeline, template email/call script.',
            category: 'admin',
            priority: 'high',
            estimatedHours: 3,
          },
          {
            title: 'Shadow 5 cuộc gọi senior',
            description: 'Quan sát cách senior pitch, xử lý từ chối, follow-up.',
            category: 'practice',
            priority: 'high',
            estimatedHours: 5,
          },
          {
            title: '1-1 với Head of Sales',
            description: 'Định hướng chiến lược, kỳ vọng KPI 30/60/90 ngày.',
            category: 'meeting',
            priority: 'high',
            estimatedHours: 1,
          },
        ],
      },
      {
        name: 'Day 31-60 — Đi cùng senior & first deal',
        description: 'Pair với senior trên deal thật, chốt 1 deal đầu tiên.',
        startOffsetDays: 30,
        endOffsetDays: 60,
        tasks: [
          {
            title: 'Đồng hành 10 cuộc gọi cùng senior',
            description: 'Quan sát + tham gia một phần pitch, ghi note follow-up.',
            category: 'practice',
            priority: 'high',
            estimatedHours: 10,
          },
          {
            title: 'Chốt deal đầu tiên độc lập',
            description: 'Một deal nhỏ end-to-end: lead → demo → đàm phán → ký hợp đồng.',
            category: 'practice',
            priority: 'high',
            estimatedHours: 16,
          },
          {
            title: 'Roleplay xử lý từ chối với mentor',
            description: 'Luyện 5 tình huống khách từ chối phổ biến + cách phản hồi.',
            category: 'practice',
            priority: 'medium',
            estimatedHours: 4,
          },
          {
            title: 'Review giữa kỳ với Sales Manager',
            description: 'Phân tích pipeline, conversion rate, điểm cần cải thiện.',
            category: 'review',
            priority: 'high',
            estimatedHours: 1,
          },
        ],
      },
      {
        name: 'Day 61-90 — Đạt KPI & chủ động pipeline',
        description: 'Quản lý pipeline cá nhân, đạt KPI tháng đầu, đánh giá 90 ngày.',
        startOffsetDays: 60,
        endOffsetDays: 90,
        tasks: [
          {
            title: 'Đạt 70% KPI tháng đầu',
            description: 'Số lead, số demo, số deal closed theo target.',
            category: 'practice',
            priority: 'high',
            estimatedHours: 30,
          },
          {
            title: 'Tự chạy 2 demo sản phẩm cho khách',
            description: 'Demo độc lập, có ghi hình lại để mentor review.',
            category: 'practice',
            priority: 'high',
            estimatedHours: 6,
          },
          {
            title: 'Đánh giá 90 ngày cùng Head of Sales',
            description: 'Tổng kết deal closed, pipeline, mục tiêu quý tới.',
            category: 'review',
            priority: 'high',
            estimatedHours: 1,
          },
        ],
      },
    ],
  },
  {
    slug: 'operations-specialist-60d',
    name: 'Onboarding Operations Specialist 60 ngày',
    description: 'Lộ trình rút gọn 60 ngày cho Operations Specialist phụ trách quy trình nội bộ.',
    targetPosition: 'Operations Specialist',
    totalDays: 60,
    isSystem: true,
    stages: [
      {
        name: '30 ngày đầu — Hiểu quy trình & công cụ',
        description: 'Nắm quy trình vận hành, hệ thống, KPI ops.',
        startOffsetDays: 0,
        endOffsetDays: 30,
        tasks: [
          {
            title: 'Đọc Ops Handbook',
            description: 'Quy trình vận hành lõi, SLA, escalation matrix.',
            category: 'learning',
            priority: 'high',
            estimatedHours: 6,
          },
          {
            title: 'Setup tài khoản công cụ vận hành',
            description: 'Helpdesk, ticketing, monitoring, internal admin tools.',
            category: 'admin',
            priority: 'high',
            estimatedHours: 3,
          },
          {
            title: 'Shadow 1 ngày với Ops Lead',
            description: 'Quan sát flow ticket triage, daily ops sync, escalation.',
            category: 'practice',
            priority: 'high',
            estimatedHours: 8,
          },
          {
            title: '1-1 với Ops Manager',
            description: 'Định hướng KPI 60 ngày, xác định owner area cụ thể.',
            category: 'meeting',
            priority: 'high',
            estimatedHours: 1,
          },
        ],
      },
      {
        name: 'Day 31-60 — Tự chủ một mảng ops',
        description: 'Nhận trách nhiệm một mảng ops cụ thể, đo bằng KPI.',
        startOffsetDays: 30,
        endOffsetDays: 60,
        tasks: [
          {
            title: 'Owner 1 quy trình ops',
            description: 'Vận hành, đo lường, đề xuất cải tiến cho 1 quy trình cụ thể.',
            category: 'practice',
            priority: 'high',
            estimatedHours: 30,
          },
          {
            title: 'Đề xuất 1 cải tiến quy trình',
            description: 'Slide đề xuất + impact estimate + plan triển khai.',
            category: 'practice',
            priority: 'medium',
            estimatedHours: 8,
          },
          {
            title: 'Đánh giá 60 ngày cùng Ops Manager',
            description: 'Review KPI mảng phụ trách, plan tháng tiếp theo.',
            category: 'review',
            priority: 'high',
            estimatedHours: 1,
          },
        ],
      },
    ],
  },
];

async function seedOnboardingTemplates(context) {
  const { prisma } = context;
  let created = 0;
  let updated = 0;

  for (const template of TEMPLATES) {
    const existing = await prisma.onboardingTemplate.findUnique({
      where: { slug: template.slug },
    });

    if (existing) {
      // Wipe stages (cascades tasks) and recreate
      await prisma.onboardingStage.deleteMany({
        where: { templateId: existing.id },
      });
      await prisma.onboardingTemplate.update({
        where: { id: existing.id },
        data: {
          name: template.name,
          description: template.description,
          targetPosition: template.targetPosition,
          totalDays: template.totalDays,
          isActive: true,
          isSystem: true,
        },
      });
      await writeStages(prisma, existing.id, template.stages);
      updated += 1;
    } else {
      const createdTemplate = await prisma.onboardingTemplate.create({
        data: {
          slug: template.slug,
          name: template.name,
          description: template.description,
          targetPosition: template.targetPosition,
          totalDays: template.totalDays,
          isActive: true,
          isSystem: true,
        },
      });
      await writeStages(prisma, createdTemplate.id, template.stages);
      created += 1;
    }
  }

  console.log(
    `  Onboarding templates: ${created} created, ${updated} updated (${TEMPLATES.length} total)`,
  );
  return { created, updated, total: TEMPLATES.length };
}

async function writeStages(prisma, templateId, stages) {
  for (let i = 0; i < stages.length; i += 1) {
    const stage = stages[i];
    const createdStage = await prisma.onboardingStage.create({
      data: {
        templateId,
        name: stage.name,
        description: stage.description ?? null,
        orderIndex: i,
        startOffsetDays: stage.startOffsetDays,
        endOffsetDays: stage.endOffsetDays,
      },
    });
    if (stage.tasks?.length > 0) {
      await prisma.onboardingTask.createMany({
        data: stage.tasks.map((task, idx) => ({
          stageId: createdStage.id,
          title: task.title,
          description: task.description ?? null,
          category: task.category ?? 'learning',
          priority: task.priority ?? 'medium',
          estimatedHours: task.estimatedHours ?? 2,
          orderIndex: idx,
          status: 'pending',
        })),
      });
    }
  }
}

module.exports = { seedOnboardingTemplates };
