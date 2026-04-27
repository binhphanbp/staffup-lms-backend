'use strict';

/**
 * Master skill catalog used by Skill Gap Analysis (P2.2) and Department Analytics.
 *
 * Categories:
 *   - tech    — programming languages, frameworks, infra
 *   - soft    — interpersonal, leadership, productivity
 *   - domain  — business / functional expertise
 */
const SKILLS = [
  // ── Tech ──────────────────────────────────────────────
  { slug: 'javascript', name: 'JavaScript', category: 'tech', description: 'Ngôn ngữ lập trình web cơ bản, ES6+, async/await, modules.' },
  { slug: 'typescript', name: 'TypeScript', category: 'tech', description: 'Static typing trên JavaScript, generics, advanced types.' },
  { slug: 'reactjs', name: 'React', category: 'tech', description: 'UI library với hooks, context, state management.' },
  { slug: 'nextjs', name: 'Next.js', category: 'tech', description: 'Fullstack React framework, SSR/ISR, App Router.' },
  { slug: 'nodejs', name: 'Node.js', category: 'tech', description: 'Runtime JavaScript phía server, Express/Fastify, async I/O.' },
  { slug: 'python', name: 'Python', category: 'tech', description: 'General-purpose, FastAPI/Django, data tooling.' },
  { slug: 'java', name: 'Java', category: 'tech', description: 'Spring Boot, JVM, OOP backend.' },
  { slug: 'sql', name: 'SQL', category: 'tech', description: 'Truy vấn quan hệ, joins, indexes, performance tuning.' },
  { slug: 'postgresql', name: 'PostgreSQL', category: 'tech', description: 'Vận hành Postgres, pgvector, replication.' },
  { slug: 'mongodb', name: 'MongoDB', category: 'tech', description: 'Document DB, aggregation pipeline, replica set.' },
  { slug: 'redis', name: 'Redis', category: 'tech', description: 'In-memory cache, pub/sub, queue.' },
  { slug: 'docker', name: 'Docker', category: 'tech', description: 'Container hóa ứng dụng, Dockerfile, Compose.' },
  { slug: 'kubernetes', name: 'Kubernetes', category: 'tech', description: 'Orchestration container, deployment, ingress.' },
  { slug: 'aws', name: 'AWS', category: 'tech', description: 'Cloud cơ bản: EC2, S3, RDS, Lambda, IAM.' },
  { slug: 'linux', name: 'Linux & Shell', category: 'tech', description: 'Vận hành Linux, bash scripting, cron, systemd.' },
  { slug: 'git', name: 'Git & GitHub', category: 'tech', description: 'Version control, branching, PR review.' },
  { slug: 'rest-api', name: 'REST API Design', category: 'tech', description: 'Thiết kế REST, HTTP semantics, OpenAPI.' },
  { slug: 'graphql', name: 'GraphQL', category: 'tech', description: 'Schema design, resolvers, federation.' },
  { slug: 'microservices', name: 'Microservices', category: 'tech', description: 'Decomposition, async messaging, observability.' },
  { slug: 'ci-cd', name: 'CI/CD', category: 'tech', description: 'Pipeline tự động hoá build, test, deploy.' },
  { slug: 'testing', name: 'Automated Testing', category: 'tech', description: 'Unit, integration, e2e với Jest/Vitest/Playwright.' },
  { slug: 'cybersecurity', name: 'Cybersecurity', category: 'tech', description: 'OWASP, threat modeling, secure coding.' },

  // ── Soft ──────────────────────────────────────────────
  { slug: 'communication', name: 'Giao tiếp', category: 'soft', description: 'Trình bày rõ ràng, lắng nghe, viết technical.' },
  { slug: 'teamwork', name: 'Làm việc nhóm', category: 'soft', description: 'Hợp tác cross-functional, code review tích cực.' },
  { slug: 'problem-solving', name: 'Giải quyết vấn đề', category: 'soft', description: 'Phân tích root cause, debug có hệ thống.' },
  { slug: 'time-management', name: 'Quản lý thời gian', category: 'soft', description: 'Ưu tiên công việc, ước lượng, deadline.' },
  { slug: 'leadership', name: 'Lãnh đạo', category: 'soft', description: 'Coaching, delegation, ra quyết định.' },
  { slug: 'critical-thinking', name: 'Tư duy phản biện', category: 'soft', description: 'Đặt câu hỏi đúng, đánh giá trade-off.' },
  { slug: 'mentoring', name: 'Mentoring', category: 'soft', description: 'Hướng dẫn, on-board, giúp đồng đội phát triển.' },

  // ── Domain ────────────────────────────────────────────
  { slug: 'agile-scrum', name: 'Agile / Scrum', category: 'domain', description: 'Sprint planning, retro, story mapping.' },
  { slug: 'product-management', name: 'Product Management', category: 'domain', description: 'Roadmap, OKR, backlog grooming.' },
  { slug: 'ux-design', name: 'UX/UI Design', category: 'domain', description: 'Wireframe, user research, design system.' },
  { slug: 'data-analysis', name: 'Phân tích dữ liệu', category: 'domain', description: 'SQL, BI, visualization, storytelling.' },
  { slug: 'machine-learning', name: 'Machine Learning', category: 'domain', description: 'Supervised/unsupervised, model evaluation.' },
];

async function seedSkills(context) {
  const { prisma } = context;
  console.log(`\n🧠Seeding skill catalog (${SKILLS.length} skills)...`);

  let created = 0;
  let updated = 0;

  for (const s of SKILLS) {
    const existing = await prisma.skill.findUnique({ where: { slug: s.slug } });
    if (existing) {
      await prisma.skill.update({
        where: { slug: s.slug },
        data: {
          name: s.name,
          description: s.description,
          category: s.category,
          isActive: true,
        },
      });
      updated += 1;
    } else {
      await prisma.skill.create({
        data: {
          slug: s.slug,
          name: s.name,
          description: s.description,
          category: s.category,
          isActive: true,
        },
      });
      created += 1;
    }
  }

  console.log(`  Skills: ${created} created, ${updated} updated (${SKILLS.length} total).`);
  return { created, updated, total: SKILLS.length };
}

module.exports = { seedSkills, SKILLS };
