import prismaClient from "../database";
import { PaginationReqType } from "../schemaValidations/common.schema";
import { SearchProductQueryType } from "../schemaValidations/product.schema";
import { NotFoundError } from "../utils/errors";

const getAllProducts = async (
  { page, limit }: PaginationReqType,
  { name, categoryIds }: SearchProductQueryType,
) => {
  console.log(name, categoryIds);
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

  const [products, totalLength] = await Promise.all([
    prismaClient.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      where: {
        AND: [
          ...(name ? [{ name: { contains: name } }] : []),
          ...(validateCategoryIds ? [validateCategoryIds] : []),
        ],
      },
      include: {
        user: true,
      },
    }),
    prismaClient.product.count({
      where: {
        AND: [
          ...(name ? [{ name: { contains: name } }] : []),
          ...(validateCategoryIds ? [validateCategoryIds] : []),
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
