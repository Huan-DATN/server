import pricesFilter from "../constants/prices-filter";
import prismaClient from "../database";
import { PaginationReqType } from "../schemaValidations/common.schema";
import { SearchProductQueryType } from "../schemaValidations/product.schema";
import { NotFoundError } from "../utils/errors";

const getAllProducts = async (
  { page, limit }: PaginationReqType,
  { name, categoryIds, priceIds }: SearchProductQueryType,
) => {
  const validateCategoryIds = categoryIds
    ? {
        categories: {
          some: {
            categoryId: {
              in: categoryIds,
            },
          },
        },
      }
    : undefined;

  // Validate priceIds if needed
  const priceRanges = priceIds
    ? priceIds.map((id) => {
        const priceRange = pricesFilter.find((item) => item.key === id);
        return priceRange
          ? {
              gte: priceRange.min,
              lte: priceRange.max,
            }
          : undefined;
      })
    : [];

  // Filter out undefined values
  const filteredPriceRanges = priceRanges.filter(
    (range) => range !== undefined,
  );

  const validatePriceIds = filteredPriceRanges.length
    ? {
        price: {
          gte: Math.min(...filteredPriceRanges.map((range) => range!.gte)),
          lte: Math.max(...filteredPriceRanges.map((range) => range!.lte)),
        },
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
          ...(validateCategoryIds ? [validateCategoryIds] : []),
          ...(validatePriceIds ? [validatePriceIds] : []),
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
        categories: {
          include: {
            category: true,
          },
        },
      },
    }),
    prismaClient.product.count({
      where: {
        AND: [
          ...(name ? [{ name: { contains: name } }] : []),
          ...(validateCategoryIds ? [validateCategoryIds] : []),
          ...(validatePriceIds ? [validatePriceIds] : []),
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
    },
  });
  if (!product) {
    throw new NotFoundError("Product not found");
  }
  return product;
};

const ProductService = { getAllProducts, getProductById };

export default ProductService;
