import { StatusCodes } from "http-status-codes";
import prismaClient from "../database";
import { NotFoundError, StatusError } from "../utils/errors";

const createCard = async (
  userId: number,
  imageId: number,
  name: string,
  accountNumber: string,
  bankName: string,
) => {
  // Check if image exists
  const image = await prismaClient.image.findUnique({
    where: {
      id: imageId,
    },
  });

  if (!image) {
    throw new NotFoundError("Image not found");
  }

  // Check if card already exists with this account number
  const existingCard = await prismaClient.cardInfo.findFirst({
    where: {
      userId,
      accountNumber,
    },
  });

  if (existingCard) {
    throw new StatusError({
      status: StatusCodes.CONFLICT,
      message: "Card with this account number already exists",
    });
  }

  // Create the card
  const card = await prismaClient.cardInfo.create({
    data: {
      userId,
      imageId,
      name,
      accountNumber,
      bankName,
    },
    include: {
      image: true,
    },
  });

  return card;
};

const getCardById = async (id: number) => {
  const card = await prismaClient.cardInfo.findUnique({
    where: {
      id,
    },
    include: {
      image: true,
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!card) {
    throw new NotFoundError("Card not found");
  }

  return card;
};

const getUserCards = async (userId: number) => {
  const cards = await prismaClient.cardInfo.findMany({
    where: {
      userId,
      isActive: true,
    },
    include: {
      image: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return cards;
};

const updateCard = async (
  id: number,
  userId: number,
  data: {
    name?: string;
    accountNumber?: string;
    bankName?: string;
    imageId?: number;
    isActive?: boolean;
  },
) => {
  // Check if card exists and belongs to user
  const card = await prismaClient.cardInfo.findUnique({
    where: {
      id,
    },
  });

  if (!card) {
    throw new NotFoundError("Card not found");
  }

  if (card.userId !== userId) {
    throw new StatusError({
      status: StatusCodes.FORBIDDEN,
      message: "You are not authorized to update this card",
    });
  }

  // If imageId is provided, check if image exists
  if (data.imageId) {
    const image = await prismaClient.image.findUnique({
      where: {
        id: data.imageId,
      },
    });

    if (!image) {
      throw new NotFoundError("Image not found");
    }
  }

  // If accountNumber is provided, check if it's unique
  if (data.accountNumber && data.accountNumber !== card.accountNumber) {
    const existingCard = await prismaClient.cardInfo.findFirst({
      where: {
        userId,
        accountNumber: data.accountNumber,
        id: {
          not: id,
        },
      },
    });

    if (existingCard) {
      throw new StatusError({
        status: StatusCodes.CONFLICT,
        message: "Card with this account number already exists",
      });
    }
  }

  // Update the card
  const updatedCard = await prismaClient.cardInfo.update({
    where: {
      id,
    },
    data,
    include: {
      image: true,
    },
  });

  return updatedCard;
};

const deleteCard = async (id: number, userId: number) => {
  // Check if card exists and belongs to user
  const card = await prismaClient.cardInfo.findUnique({
    where: {
      id,
    },
  });

  if (!card) {
    throw new NotFoundError("Card not found");
  }

  if (card.userId !== userId) {
    throw new StatusError({
      status: StatusCodes.FORBIDDEN,
      message: "You are not authorized to delete this card",
    });
  }

  // Delete the card
  await prismaClient.cardInfo.delete({
    where: {
      id,
    },
  });

  return { success: true };
};

const CardService = {
  createCard,
  getCardById,
  getUserCards,
  updateCard,
  deleteCard,
};

export default CardService;
