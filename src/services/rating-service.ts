import prismaClient from "../database";

const getRatingByProductId = async (
  productId: number,
  {
    page = 1,
    limit = 6,
  }: {
    page?: number;
    limit?: number;
  },
) => {
  const [data, totalRatings] = await Promise.all([
    prismaClient.rating.findMany({
      where: {
        productId,
      },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: true,
        product: {
          include: {
            user: true,
            categories: true,
            groupProduct: true,
            images: true,
            city: true,
          },
        },
      },
    }),
    prismaClient.rating.count({
      where: {
        productId,
      },
    }),
  ]);

  return {
    data,
    totalRatings,
    totalPages: Math.ceil(totalRatings / limit),
  };
};

const getAllRatings = async () => {
  const ratings = await prismaClient.rating.findMany({
    include: {
      user: true,
      product: {
        include: {
          user: true,
          categories: true,
          groupProduct: true,
          images: true,
          city: true,
        },
      },
    },
  });
  return ratings;
};

const createRating = async (
  userId: number,
  orderId: number,
  productId: number,
  ratingData: any,
) => {
  const { rating, comment } = ratingData;

  const newRating = await prismaClient.rating.create({
    data: {
      userId,
      orderId,
      productId,
      rating,
      comment,
    },
    include: {
      user: true,
      product: {
        include: {
          user: true,
          categories: true,
          groupProduct: true,
          images: true,
          city: true,
        },
      },
    },
  });

  return newRating;
};

const updateRatingById = async (id: number, ratingData: any) => {
  const { rating, comment } = ratingData;

  const updatedRating = await prismaClient.rating.update({
    where: {
      id,
    },
    data: {
      rating,
      comment,
    },
    include: {
      user: true,
      product: {
        include: {
          user: true,
          categories: true,
          groupProduct: true,
          images: true,
          city: true,
        },
      },
    },
  });

  return updatedRating;
};
const deleteRatingById = async (id: number) => {
  const deletedRating = await prismaClient.rating.delete({
    where: {
      id,
    },
  });

  return deletedRating;
};

const getRatingSummaryById = async (id: number) => {
  const ratingSummary = await prismaClient.rating.aggregate({
    where: {
      productId: id,
    },
    _avg: {
      rating: true,
    },
    _count: {
      rating: true,
    },
  });

  const stars = await Promise.all(
    Array.from({ length: 5 }, (_, i) =>
      prismaClient.rating.count({
        where: {
          productId: id,
          rating: i + 1,
        },
      }),
    ),
  );

  return {
    rating: ratingSummary._avg.rating ?? 0,
    totalRatings: ratingSummary._count.rating,
    stars,
  };
};

const RatingService = {
  getAllRatings,
  createRating,
  updateRatingById,
  deleteRatingById,
  getRatingByProductId,
  getRatingSummaryById,
};

export default RatingService;
