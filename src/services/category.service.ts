import { prisma } from '@/config/database';
import { AppError, slugify } from '@/utils';
import type { CreateCategoryInput, UpdateCategoryInput } from '@/schemas/category.schema';

export class CategoryService {
  /**
   * Get all categories with hierarchical structure
   */
  static async getCategories() {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            children: true,
            courses: true,
            roadmaps: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return categories.map((cat) => ({
      ...cat,
      id: cat.id.toString(),
      parentId: cat.parentId?.toString() || null,
    }));
  }

  /**
   * Get a single category by ID
   */
  static async getCategoryById(id: string) {
    const categoryId = BigInt(id);

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        parent: {
          select: { id: true, name: true, slug: true },
        },
        children: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    return {
      ...category,
      id: category.id.toString(),
      parentId: category.parentId?.toString() || null,
      parent: category.parent ? { ...category.parent, id: category.parent.id.toString() } : null,
      children: category.children.map((child) => ({
        ...child,
        id: child.id.toString(),
      })),
    };
  }

  /**
   * Create a new category
   */
  static async createCategory(data: CreateCategoryInput) {
    const parentId = data.parentId ? BigInt(data.parentId) : null;

    // Verify parent exists if provided
    if (parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: parentId },
      });
      if (!parent) {
        throw new AppError('Parent category not found', 404);
      }
    }

    // Generate unique slug
    const slug = await this.generateUniqueSlug(data.name);

    const newCategory = await prisma.category.create({
      data: {
        name: data.name,
        slug,
        parentId,
      },
    });

    return {
      ...newCategory,
      id: newCategory.id.toString(),
      parentId: newCategory.parentId?.toString() || null,
    };
  }

  /**
   * Update an existing category
   */
  static async updateCategory(id: string, data: UpdateCategoryInput) {
    const categoryId = BigInt(id);

    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      throw new AppError('Category not found', 404);
    }

    const parentId =
      data.parentId !== undefined
        ? data.parentId
          ? BigInt(data.parentId)
          : null
        : existingCategory.parentId;

    // Prevent making a category its own parent or child
    if (parentId === categoryId) {
      throw new AppError('A category cannot be its own parent', 400);
    }

    // Verify parent exists if provided
    if (parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: parentId },
      });
      if (!parent) {
        throw new AppError('Parent category not found', 404);
      }

      // Check for parent cycles (simple one-level check for now)
      // For deep cycles, recursive check would be needed, but for MVP this is okay
    }

    let slug = existingCategory.slug;
    if (data.name && data.name !== existingCategory.name) {
      slug = await this.generateUniqueSlug(data.name);
    }

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.parentId !== undefined && { parentId }),
        slug,
      },
    });

    return {
      ...updatedCategory,
      id: updatedCategory.id.toString(),
      parentId: updatedCategory.parentId?.toString() || null,
    };
  }

  /**
   * Delete a category
   */
  static async deleteCategory(id: string) {
    const categoryId = BigInt(id);

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: {
            children: true,
            courses: true,
            roadmaps: true,
          },
        },
      },
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    if (category._count.children > 0) {
      throw new AppError(
        'Cannot delete category with sub-categories. Delete sub-categories first.',
        400,
      );
    }

    if (category._count.courses > 0 || category._count.roadmaps > 0) {
      throw new AppError(
        'Cannot delete category because it is linked to courses or roadmaps.',
        400,
      );
    }

    await prisma.category.delete({
      where: { id: categoryId },
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
      const existing = await prisma.category.findUnique({
        where: { slug: finalSlug },
      });

      if (!existing) break;

      finalSlug = `${baseSlug}-${count}`;
      count++;
    }

    return finalSlug;
  }
}
