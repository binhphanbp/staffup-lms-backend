import { prisma } from '@/config/database';
import { AppError, slugify } from '@/utils';
import type { CreateTagInput, UpdateTagInput } from '@/schemas/tag.schema';

export class TagService {
  /**
   * Get all tags
   */
  static async getTags() {
    const tags = await prisma.tag.findMany({
      orderBy: {
        name: 'asc',
      },
      include: {
        _count: {
          select: {
            courseTags: true,
          },
        },
      },
    });

    return tags.map((tag) => ({
      ...tag,
      id: tag.id.toString(),
      courseCount: tag._count.courseTags,
    }));
  }

  /**
   * Get a single tag by ID
   */
  static async getTagById(id: string) {
    const tagId = BigInt(id);

    const tag = await prisma.tag.findUnique({
      where: { id: tagId },
      include: {
        _count: {
          select: {
            courseTags: true,
          },
        },
      },
    });

    if (!tag) {
      throw new AppError('Tag not found', 404);
    }

    return {
      ...tag,
      id: tag.id.toString(),
      courseCount: tag._count.courseTags,
    };
  }

  /**
   * Create a new tag
   */
  static async createTag(data: CreateTagInput) {
    // Check if tag with name already exists
    const existingName = await prisma.tag.findUnique({
      where: { name: data.name },
    });

    if (existingName) {
      throw new AppError('Tag with this name already exists', 400);
    }

    // Generate unique slug
    const slug = await this.generateUniqueSlug(data.name);

    const newTag = await prisma.tag.create({
      data: {
        name: data.name,
        slug,
      },
    });

    return {
      ...newTag,
      id: newTag.id.toString(),
    };
  }

  /**
   * Update an existing tag
   */
  static async updateTag(id: string, data: UpdateTagInput) {
    const tagId = BigInt(id);

    const existingTag = await prisma.tag.findUnique({
      where: { id: tagId },
    });

    if (!existingTag) {
      throw new AppError('Tag not found', 404);
    }

    let slug = existingTag.slug;
    if (data.name && data.name !== existingTag.name) {
      // Check if tag with name already exists
      const existingName = await prisma.tag.findUnique({
        where: { name: data.name },
      });

      if (existingName) {
        throw new AppError('Tag with this name already exists', 400);
      }

      slug = await this.generateUniqueSlug(data.name);
    }

    const updatedTag = await prisma.tag.update({
      where: { id: tagId },
      data: {
        ...(data.name && { name: data.name }),
        slug,
      },
    });

    return {
      ...updatedTag,
      id: updatedTag.id.toString(),
    };
  }

  /**
   * Delete a tag
   */
  static async deleteTag(id: string) {
    const tagId = BigInt(id);

    const tag = await prisma.tag.findUnique({
      where: { id: tagId },
      include: {
        _count: {
          select: {
            courseTags: true,
          },
        },
      },
    });

    if (!tag) {
      throw new AppError('Tag not found', 404);
    }

    if (tag._count.courseTags > 0) {
      throw new AppError('Cannot delete tag because it is linked to courses.', 400);
    }

    await prisma.tag.delete({
      where: { id: tagId },
    });
  }

  /**
   * Helper to generate a unique slug
   */
  private static async generateUniqueSlug(name: string): Promise<string> {
    const baseSlug = slugify(name);
    let finalSlug = baseSlug;
    let count = 1;

    while (true) {
      const existing = await prisma.tag.findUnique({
        where: { slug: finalSlug },
      });

      if (!existing) break;

      finalSlug = `${baseSlug}-${count}`;
      count++;
    }

    return finalSlug;
  }
}
