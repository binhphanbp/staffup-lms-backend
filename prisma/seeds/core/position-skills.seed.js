'use strict';

/**
 * Position-Skill matrix used by Skill Gap Analysis (P2.2) and Department Analytics.
 *
 * Each entry maps a position title (matching `users.position_title`) to a list
 * of required skills with target levels (1..5). A skill marked `isCore: true`
 * carries higher weight in gap calculations.
 *
 * Levels are interpreted as:
 *   1 — Awareness, basic concepts
 *   2 — Foundation, can do under guidance
 *   3 — Working independently on standard tasks
 *   4 — Senior, can lead small teams / mentor
 *   5 — Expert, sets standards / architects
 */
const POSITIONS = [
  {
    title: 'Junior Developer',
    skills: [
      { slug: 'javascript', target: 3, isCore: true },
      { slug: 'typescript', target: 2 },
      { slug: 'reactjs', target: 2 },
      { slug: 'git', target: 3, isCore: true },
      { slug: 'rest-api', target: 2 },
      { slug: 'sql', target: 2 },
      { slug: 'testing', target: 2 },
      { slug: 'communication', target: 3, isCore: true },
      { slug: 'teamwork', target: 3 },
      { slug: 'problem-solving', target: 3 },
    ],
  },
  {
    title: 'Backend Developer',
    skills: [
      { slug: 'nodejs', target: 4, isCore: true },
      { slug: 'python', target: 3 },
      { slug: 'sql', target: 4, isCore: true },
      { slug: 'postgresql', target: 3 },
      { slug: 'redis', target: 2 },
      { slug: 'docker', target: 3, isCore: true },
      { slug: 'rest-api', target: 4, isCore: true },
      { slug: 'microservices', target: 3 },
      { slug: 'git', target: 3 },
      { slug: 'testing', target: 3 },
      { slug: 'problem-solving', target: 3 },
    ],
  },
  {
    title: 'Frontend Developer',
    skills: [
      { slug: 'javascript', target: 4, isCore: true },
      { slug: 'typescript', target: 4, isCore: true },
      { slug: 'reactjs', target: 4, isCore: true },
      { slug: 'nextjs', target: 3 },
      { slug: 'git', target: 3 },
      { slug: 'rest-api', target: 3 },
      { slug: 'testing', target: 3 },
      { slug: 'ux-design', target: 2 },
      { slug: 'communication', target: 3 },
    ],
  },
  {
    title: 'Full Stack Developer',
    skills: [
      { slug: 'javascript', target: 4, isCore: true },
      { slug: 'typescript', target: 4 },
      { slug: 'reactjs', target: 3 },
      { slug: 'nodejs', target: 4, isCore: true },
      { slug: 'sql', target: 3 },
      { slug: 'docker', target: 3 },
      { slug: 'rest-api', target: 4 },
      { slug: 'git', target: 3 },
      { slug: 'testing', target: 3 },
      { slug: 'problem-solving', target: 3 },
    ],
  },
  {
    title: 'DevOps Engineer',
    skills: [
      { slug: 'docker', target: 4, isCore: true },
      { slug: 'kubernetes', target: 4, isCore: true },
      { slug: 'aws', target: 4, isCore: true },
      { slug: 'linux', target: 4 },
      { slug: 'ci-cd', target: 4, isCore: true },
      { slug: 'cybersecurity', target: 3 },
      { slug: 'problem-solving', target: 4 },
    ],
  },
  {
    title: 'Data Analyst',
    skills: [
      { slug: 'python', target: 3 },
      { slug: 'sql', target: 4, isCore: true },
      { slug: 'data-analysis', target: 4, isCore: true },
      { slug: 'critical-thinking', target: 3 },
      { slug: 'communication', target: 3 },
      { slug: 'problem-solving', target: 3 },
    ],
  },
  {
    title: 'ML Engineer',
    skills: [
      { slug: 'python', target: 4, isCore: true },
      { slug: 'machine-learning', target: 4, isCore: true },
      { slug: 'sql', target: 3 },
      { slug: 'data-analysis', target: 3 },
      { slug: 'docker', target: 3 },
      { slug: 'aws', target: 3 },
    ],
  },
  {
    title: 'HR Specialist',
    skills: [
      { slug: 'communication', target: 4, isCore: true },
      { slug: 'teamwork', target: 4 },
      { slug: 'problem-solving', target: 3 },
      { slug: 'time-management', target: 3 },
      { slug: 'leadership', target: 3 },
    ],
  },
  {
    title: 'Training Coordinator',
    skills: [
      { slug: 'communication', target: 4, isCore: true },
      { slug: 'time-management', target: 4 },
      { slug: 'teamwork', target: 3 },
      { slug: 'mentoring', target: 3 },
      { slug: 'leadership', target: 2 },
    ],
  },
  {
    title: 'UI/UX Designer',
    skills: [
      { slug: 'ux-design', target: 4, isCore: true },
      { slug: 'communication', target: 3 },
      { slug: 'critical-thinking', target: 3 },
      { slug: 'teamwork', target: 3 },
    ],
  },
  {
    title: 'Product Designer',
    skills: [
      { slug: 'ux-design', target: 4, isCore: true },
      { slug: 'product-management', target: 3 },
      { slug: 'communication', target: 3 },
      { slug: 'critical-thinking', target: 3 },
    ],
  },
  {
    title: 'Sales Executive',
    skills: [
      { slug: 'communication', target: 4, isCore: true },
      { slug: 'teamwork', target: 3 },
      { slug: 'time-management', target: 3 },
      { slug: 'critical-thinking', target: 3 },
    ],
  },
  {
    title: 'Penetration Tester',
    skills: [
      { slug: 'cybersecurity', target: 4, isCore: true },
      { slug: 'linux', target: 4 },
      { slug: 'problem-solving', target: 4 },
      { slug: 'critical-thinking', target: 4 },
      { slug: 'python', target: 3 },
    ],
  },
];

async function seedPositionSkills(context) {
  const { prisma } = context;

  // Resolve all skill slugs → ids in one query
  const skills = await prisma.skill.findMany({
    select: { id: true, slug: true },
  });
  const skillBySlug = new Map(skills.map((s) => [s.slug, s.id]));

  let created = 0;
  let updated = 0;
  let totalRows = 0;
  let positionsProcessed = 0;
  const missing = new Set();

  console.log(`\n🎯Seeding position-skill matrix (${POSITIONS.length} positions)...`);

  for (const position of POSITIONS) {
    let positionUpserts = 0;
    for (const entry of position.skills) {
      const skillId = skillBySlug.get(entry.slug);
      if (!skillId) {
        missing.add(entry.slug);
        continue;
      }
      totalRows += 1;
      const existing = await prisma.positionSkill.findUnique({
        where: {
          positionTitle_skillId: {
            positionTitle: position.title,
            skillId,
          },
        },
      });
      const data = {
        positionTitle: position.title,
        skillId,
        targetLevel: entry.target,
        weight: entry.isCore ? 1.5 : 1.0,
        isCore: entry.isCore ?? false,
      };
      if (existing) {
        await prisma.positionSkill.update({
          where: { id: existing.id },
          data: { targetLevel: data.targetLevel, weight: data.weight, isCore: data.isCore },
        });
        updated += 1;
      } else {
        await prisma.positionSkill.create({ data });
        created += 1;
      }
      positionUpserts += 1;
    }
    if (positionUpserts > 0) positionsProcessed += 1;
  }

  if (missing.size > 0) {
    console.warn(`  ⚠ Missing skills (skipped): ${Array.from(missing).join(', ')}`);
  }
  console.log(
    `  Position-Skill matrix: ${created} created, ${updated} updated (${positionsProcessed} positions × ~${Math.round(totalRows / Math.max(positionsProcessed, 1))} skills each = ${totalRows} rows).`,
  );
  return { created, updated, total: totalRows, positions: positionsProcessed };
}

module.exports = { seedPositionSkills, POSITIONS };
