import prismaClient from "../database";
import { GetCategoriesRequest } from "../schemaValidations/request/category.schema";
import { ConflictError, NotFoundError } from "../utils/errors";

export interface CreateCategoryData {
  name: string;
  isActive?: boolean;
}

export interface UpdateCategoryData {
  name?: string;
  isActive?: boolean;
}

export interface CategoryWithProductCount {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    products: number;
  };
}

export interface PaginationResponse {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface GetCategoriesResponse {
  categories: CategoryWithProductCount[];
  pagination: PaginationResponse;
}

const getAllCategories = async (
  params: GetCategoriesRequest | undefined,
): Promise<GetCategoriesResponse> => {
  const {
    page = 1,
    limit = 10,
    name,
    isActive,
    sortBy = "name",
    sortOrder = "asc",
  } = params || {};

  const pageNumber = page;
  const limitNumber = limit;
  const skip = (pageNumber - 1) * limitNumber;

  // Build where clause
  const where: any = {};

  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  if (name) {
    where.name = {
      contains: name,
      mode: "insensitive",
    };
  }

  // Build orderBy clause
  const orderBy: any = {};
  orderBy[sortBy] = sortOrder;

  // Get total count for pagination
  const totalCount = await prismaClient.category.count({ where });

  // Get categories
  const categories = await prismaClient.category.findMany({
    where,
    orderBy,
    skip,
    take: limitNumber,
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  const totalPages = Math.ceil(totalCount / limitNumber);

  return {
    categories,
    pagination: {
      currentPage: pageNumber,
      totalPages,
      totalCount,
      limit: limitNumber,
      hasNext: pageNumber < totalPages,
      hasPrev: pageNumber > 1,
    },
  };
};

const getCategoryById = async (
  id: number,
): Promise<CategoryWithProductCount> => {
  const category = await prismaClient.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  if (!category) {
    throw new NotFoundError("Category not found");
  }

  return category;
};

const createCategory = async (
  data: CreateCategoryData,
): Promise<CategoryWithProductCount> => {
  const { name, isActive = true } = data;

  // Check if category with same name already exists
  const existingCategory = await prismaClient.category.findFirst({
    where: {
      name: {
        equals: name,
        mode: "insensitive",
      },
    },
  });

  if (existingCategory) {
    throw new ConflictError("Category with this name already exists");
  }

  const category = await prismaClient.category.create({
    data: {
      name,
      isActive,
    },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  return category;
};

const updateCategory = async (
  id: number,
  data: UpdateCategoryData,
): Promise<CategoryWithProductCount> => {
  const { name, isActive } = data;

  // Check if category exists
  const existingCategory = await prismaClient.category.findUnique({
    where: { id },
  });

  if (!existingCategory) {
    throw new NotFoundError("Category not found");
  }

  // If name is being updated, check for duplicates
  if (name && name !== existingCategory.name) {
    const duplicateCategory = await prismaClient.category.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
        id: {
          not: id,
        },
      },
    });

    if (duplicateCategory) {
      throw new ConflictError("Category with this name already exists");
    }
  }

  // Build update data
  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (isActive !== undefined) updateData.isActive = isActive;

  const updatedCategory = await prismaClient.category.update({
    where: { id },
    data: updateData,
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  return updatedCategory;
};

const deleteCategory = async (id: number): Promise<void> => {
  // Check if category exists
  const existingCategory = await prismaClient.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  if (!existingCategory) {
    throw new NotFoundError("Category not found");
  }

  // Check if category has products
  if (existingCategory._count.products > 0) {
    throw new ConflictError(
      "Cannot delete category with associated products. Please remove or reassign products first.",
    );
  }

  await prismaClient.category.delete({
    where: { id },
  });
};

const checkCategoryExists = async (id: number): Promise<boolean> => {
  const category = await prismaClient.category.findUnique({
    where: { id },
  });
  return !!category;
};

const getCategoriesByIds = async (
  ids: number[],
): Promise<CategoryWithProductCount[]> => {
  const categories = await prismaClient.category.findMany({
    where: {
      id: {
        in: ids,
      },
    },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  return categories;
};

const getActiveCategoriesOnly = async (): Promise<
  CategoryWithProductCount[]
> => {
  const categories = await prismaClient.category.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  return categories;
};

const getCategoryStats = async () => {
  const [totalCategories, activeCategories, inactiveCategories] =
    await Promise.all([
      prismaClient.category.count(),
      prismaClient.category.count({ where: { isActive: true } }),
      prismaClient.category.count({ where: { isActive: false } }),
    ]);

  return {
    totalCategories,
    activeCategories,
    inactiveCategories,
  };
};

export {
  checkCategoryExists,
  createCategory,
  deleteCategory,
  getActiveCategoriesOnly,
  getAllCategories,
  getCategoriesByIds,
  getCategoryById,
  getCategoryStats,
  updateCategory,
};
