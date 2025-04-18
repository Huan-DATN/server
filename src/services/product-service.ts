import prismaClient from "../database";
import { PaginationReqType } from "../schemaValidations/common.schema";
import { SearchProductQueryType } from "../schemaValidations/product.schema";
import { NotFoundError } from "../utils/errors";

const getAllProducts = async (
  { page, limit }: PaginationReqType,
  { name, categoryId, groupProductId, cityId }: SearchProductQueryType,
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
        createdAt: "desc",
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
        ],
      },
      include: {
        user: true,
        categories: true,
        groupProduct: true,
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
) => {
  const [products, totalLength] = await Promise.all([
    prismaClient.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      where: {
        userId: id,
      },
      include: {
        user: true,
        categories: true,
        groupProduct: true,
      },
    }),
    prismaClient.product.count({
      where: {
        userId: id,
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

const ProductService = { getAllProducts, getProductById, getProductsShop };

export default ProductService;
