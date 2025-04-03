import prismaClient from "../database";
import { PaginationReqType } from "../schemaValidations/common.schema";
import { SearchProductQueryType } from "../schemaValidations/product.schema";

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

const ProductService = { getAllProducts };

export default ProductService;
