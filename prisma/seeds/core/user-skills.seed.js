'use strict';

/**
 * User-Skill assessments — for every user that has a positionTitle matching one
 * of the seeded positions, this seed creates a current-level entry per required
 * skill so that Skill Gap heatmap, Skill Profile, and Department Analytics have
 * realistic data.
 *
 * Strategy (pseudo-random but deterministic so re-runs do not flap):
 *   - 60% of skills sit 1 level below target (clear gap)
 *   - 25% meet target
 *   - 10% exceed target by 1
 *   -  5% sit 2 levels below target (severe gap, drives at-risk surface)
 *
 * The PRNG seed is `userId * 31 + skillId` so output is stable per user-skill.
 */

const { POSITIONS } = require('./position-skills.seed');

function deterministicPick(seed) {
  // xorshift32 → produces a number in [0, 1)
  let x = seed | 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  // Map to [0, 1)
  return ((x >>> 0) % 100000) / 100000;
}

function pickCurrentLevel(target, seed) {
  const r = deterministicPick(seed);
  let level;
  if (r < 0.05) level = target - 2;
  else if (r < 0.65) level = target - 1;
  else if (r < 0.9) level = target;
  else level = target + 1;
  // Clamp into [1, 5]
  return Math.max(1, Math.min(5, level));
}

async function seedUserSkills(context) {
  const { prisma } = context;

  console.log(`\n🧪Seeding user-skill assessments...`);

  // Map positionTitle → skill list
  const positionByTitle = new Map(POSITIONS.map((p) => [p.title, p.skills]));

  // Resolve all skill slugs to ids
  const skills = await prisma.skill.findMany({ select: { id: true, slug: true } });
  const skillIdBySlug = new Map(skills.map((s) => [s.slug, s.id]));

  // Pull all users that have a positionTitle we know about
  const users = await prisma.user.findMany({
    where: { positionTitle: { in: Array.from(positionByTitle.keys()) } },
    select: { id: true, fullName: true, positionTitle: true },
  });
  console.log(`  Found ${users.length} user(s) with mapped positions.`);

  let created = 0;
  let updated = 0;
  let totalRows = 0;

  for (const user of users) {
    if (!user.positionTitle) continue;
    const skillSpec = positionByTitle.get(user.positionTitle);
    if (!skillSpec) continue;

    for (const entry of skillSpec) {
      const skillId = skillIdBySlug.get(entry.slug);
      if (!skillId) continue;
      totalRows += 1;

      const userIdNum = Number(user.id);
      const skillIdNum = Number(skillId);
      const seed = userIdNum * 31 + skillIdNum;
      const currentLevel = pickCurrentLevel(entry.target, seed);

      const existing = await prisma.userSkill.findUnique({
        where: { userId_skillId: { userId: user.id, skillId } },
      });
      const data = {
        userId: user.id,
        skillId,
        currentLevel,
        source: 'self',
        notes: 'Seeded for demo',
      };
      if (existing) {
        await prisma.userSkill.update({
          where: { id: existing.id },
          data: { currentLevel: data.currentLevel, source: data.source, notes: data.notes },
        });
        updated += 1;
      } else {
        await prisma.userSkill.create({ data });
        created += 1;
      }
    }
  }

  console.log(
    `  User-Skills: ${created} created, ${updated} updated (${totalRows} rows across ${users.length} users).`,
  );
  return { created, updated, total: totalRows, users: users.length };
}

module.exports = { seedUserSkills };
