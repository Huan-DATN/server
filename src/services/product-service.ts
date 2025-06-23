import prismaClient from "../database";
import { PaginationReqType } from "../schemaValidations/common.schema";
import { SearchProductQueryType } from "../schemaValidations/product.schema";
import { CreateProductBodyType } from "../schemaValidations/request/create-product";
import { NotFoundError } from "../utils/errors";

const getAllProducts = async (
  { page, limit }: PaginationReqType,
  { name, categoryId, groupProductId, cityId }: SearchProductQueryType,
  {
    sortBy,
    sortOrder,
  }: {
    sortBy: string;
    sortOrder: string;
  },
  { minPrice, maxPrice }: SearchProductQueryType,
  isActive: boolean | undefined,
) => {
  const validateCategoryId = categoryId
    ? {
        categories: {
          some: {
            categoryId: {
              in: categoryId,
            },
          },
        },
      }
    : undefined;

  const validateGroupProductId = groupProductId
    ? {
        groupProduct: {
          id: {
            in: groupProductId,
          },
        },
      }
    : undefined;

  const validateCityId = cityId
    ? {
        cityId: cityId,
      }
    : undefined;

  const [products, totalLength] = await Promise.all([
    prismaClient.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      where: {
        AND: [
          ...(validateGroupProductId ? [validateGroupProductId] : []),
          ...(validateCityId ? [validateCityId] : []),
          {
            name: {
              contains: name,
              mode: "insensitive",
            },
          },
          {
            isActive,
          },
          {
            price: {
              gte: minPrice,
              lte: maxPrice,
            },
          },
        ],
      },
      include: {
        user: true,
        categories: true,
        groupProduct: true,
        images: true,
      },
    }),
    prismaClient.product.count({
      where: {
        AND: [
          ...(validateGroupProductId ? [validateGroupProductId] : []),
          ...(validateCityId ? [validateCityId] : []),
          {
            name: {
              contains: name,
              mode: "insensitive",
            },
          },
          {
            isActive,
          },
          {
            price: {
              gte: minPrice,
              lte: maxPrice,
            },
          },
        ],
      },
    }),
  ]);
  const totalProducts = totalLength;
  const totalPages = Math.ceil(totalLength / limit);
  return {
    products,
    totalProducts,
    totalPages,
  };
};

const getProductById = async (id: number) => {
  const product = await prismaClient.product.findUnique({
    where: {
      id,
    },
    include: {
      user: true,
      categories: true,
      city: true,
      groupProduct: true,
      images: true,
    },
  });
  if (!product) {
    throw new NotFoundError("Product not found");
  }
  return product;
};

const getProductsShop = async (
  id: number,
  { page, limit }: PaginationReqType,
  isActive: boolean | undefined,
  { name, groupProductId, cityId }: SearchProductQueryType,
  {
    sortBy,
    sortOrder,
  }: {
    sortBy: string;
    sortOrder: string;
  },
) => {
  const [products, totalLength] = await Promise.all([
    prismaClient.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      where: {
        userId: id,
        isActive,
        ...(name
          ? {
              name: {
                contains: name,
                mode: "insensitive",
              },
            }
          : {}),
      },
      include: {
        user: true,
        categories: true,
        groupProduct: true,
        images: true,
      },
    }),
    prismaClient.product.count({
      where: {
        userId: id,
        isActive,
        ...(name
          ? {
              name: {
                contains: name,
                mode: "insensitive",
              },
            }
          : {}),
      },
    }),
  ]);
  const totalProducts = totalLength;
  const totalPages = Math.ceil(totalLength / limit);
  return {
    products,
    totalProducts,
    totalPages,
  };
};

const createProduct = async (
  userId: number,
  {
    name,
    description,
    price,
    cityId,
    groupProductId,
    categories,
    images,
    star,
    quantity,
  }: CreateProductBodyType,
) => {
  const product = await prismaClient.product.create({
    data: {
      name,
      description,
      price,
      cityId,
      groupProductId,
      userId,
      quantity,
      star,
      categories: {
        connect: categories.map((id) => ({
          id,
        })),
      },
      isActive: true,
      images: {
        connect: images.map((id) => ({
          id,
        })),
      },
    },
  });

  return product;
};

const updateProductById = async (
  id: number,
  {
    name,
    description,
    price,
    cityId,
    groupProductId,
    categories,
    images,
    star,
    quantity,
  }: CreateProductBodyType,
) => {
  const product = await prismaClient.product.update({
    where: {
      id,
    },
    data: {
      name,
      description,
      price,
      cityId,
      groupProductId,
      quantity,
      star,
      categories: {
        set: categories.map((id) => ({
          id,
        })),
      },
      images: {
        set: images.map((id) => ({
          id,
        })),
      },
    },
  });

  return product;
};

const updateProductActive = async (id: number, isActive: boolean) => {
  const product = await prismaClient.product.update({
    where: {
      id,
    },
    data: {
      isActive,
    },
  });

  return product;
};
const ProductService = {
  getAllProducts,
  getProductById,
  getProductsShop,
  createProduct,
  updateProductById,
  updateProductActive,
};

export default ProductService;
