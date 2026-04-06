import { prisma } from '@/config/database';
import { AppError, slugify } from '@/utils';
import type { CreateCategoryInput, UpdateCategoryInput } from '@/schemas/category.schema';

export interface CategoryWithCounts {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  children?: CategoryWithCounts[];
  _count: {
    children: number;
    courses: number;
    roadmaps: number;
  };
}

export class CategoryService {
  /**
   * Get all categories with hierarchical structure
   */
  static async getCategories(tree = false, onlyActive = false): Promise<CategoryWithCounts[]> {
    const where = onlyActive ? { isActive: true } : {};

    const categories = await prisma.category.findMany({
      where,
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

    const formattedCategories: CategoryWithCounts[] = categories.map((cat) => ({
      ...cat,
      id: cat.id.toString(),
      parentId: cat.parentId?.toString() || null,
    }));

    if (!tree) {
      return formattedCategories;
    }

    // Build tree
    const categoryMap = new Map<string, CategoryWithCounts>();
    formattedCategories.forEach((cat) => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    const result: CategoryWithCounts[] = [];
    categoryMap.forEach((cat) => {
      if (cat.parentId) {
        const parent = categoryMap.get(cat.parentId);
        if (parent) {
          parent.children?.push(cat);
        } else {
          // If parent is not found in the map (should not happen with valid data)
          result.push(cat);
        }
      } else {
        // Root category
        result.push(cat);
      }
    });

    return result;
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
        isActive: data.isActive ?? true,
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

      // Check for parent cycles
      if (await this.isAncestor(categoryId, parentId)) {
        throw new AppError('Cannot move a category into one of its sub-categories', 400);
      }
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
        ...(data.isActive !== undefined && { isActive: data.isActive }),
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
   * Helper to check if categoryA is an ancestor of categoryB
   */
  private static async isAncestor(categoryAId: bigint, categoryBId: bigint): Promise<boolean> {
    let currentParentId: bigint | null = categoryBId;

    while (currentParentId !== null) {
      if (currentParentId === categoryAId) {
        return true;
      }

      const parentRecord: { parentId: bigint | null } | null = await prisma.category.findUnique({
        where: { id: currentParentId },
        select: { parentId: true },
      });

      currentParentId = parentRecord?.parentId || null;
    }

    return false;
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
