import prismaClient from "../database";
import {
  CreateCarouselItemRequest,
  UpdateCarouselItemRequest,
} from "../types/carousel.types";
import { NotFoundError } from "../utils/errors";

export class CarouselService {
  /**
   * Get active carousel items for public use
   */
  async getActiveCarouselItems(limit: number = 5) {
    const carouselItems = await prismaClient.carouselItem.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        order: "asc",
      },
      take: Number(limit),
      include: {
        image: true,
      },
    });
    return carouselItems;
  }

  /**
   * Get all carousel items for admin
   */
  async getAllCarouselItems(page: number = 1, limit: number = 10) {
    const [carouselItems, totalCount] = await Promise.all([
      prismaClient.carouselItem.findMany({
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: {
          order: "asc",
        },
        include: {
          image: true,
        },
      }),
      prismaClient.carouselItem.count(),
    ]);

    return {
      items: carouselItems,
      totalCount,
      totalPages: Math.ceil(totalCount / Number(limit)),
    };
  }

  /**
   * Create a new carousel item
   */
  async createCarouselItem(data: CreateCarouselItemRequest) {
    const { title, imageId, linkUrl, order = 0, isActive = true } = data;

    return prismaClient.carouselItem.create({
      data: {
        title,
        imageId,
        linkUrl,
        order,
        isActive,
      },
      include: {
        image: true,
      },
    });
  }

  /**
   * Update an existing carousel item
   */
  async updateCarouselItem(id: number, data: UpdateCarouselItemRequest) {
    const existingItem = await prismaClient.carouselItem.findUnique({
      where: { id: Number(id) },
    });

    if (!existingItem) {
      throw new NotFoundError("Carousel item not found");
    }

    return prismaClient.carouselItem.update({
      where: { id: Number(id) },
      data,
      include: {
        image: true,
      },
    });
  }

  /**
   * Delete a carousel item
   */
  async deleteCarouselItem(id: number) {
    const existingItem = await prismaClient.carouselItem.findUnique({
      where: { id: Number(id) },
    });

    if (!existingItem) {
      throw new NotFoundError("Carousel item not found");
    }

    return prismaClient.carouselItem.delete({
      where: { id: Number(id) },
    });
  }

  /**
   * Toggle carousel item status
   */
  async toggleCarouselItemStatus(id: number, isActive: boolean) {
    const existingItem = await prismaClient.carouselItem.findUnique({
      where: { id: Number(id) },
    });

    if (!existingItem) {
      throw new NotFoundError("Carousel item not found");
    }

    return prismaClient.carouselItem.update({
      where: { id: Number(id) },
      data: {
        isActive,
      },
      include: {
        image: true,
      },
    });
  }
}
