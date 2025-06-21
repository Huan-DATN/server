import { StatusCodes } from "http-status-codes";
import prismaClient from "../database";
import { NotFoundError, StatusError } from "../utils/errors";

const createPayment = async (
  userId: number,
  orderId: number,
  imageId: number,
  amount: number,
) => {
  // Check if order exists
  const order = await prismaClient.orderDetail.findUnique({
    where: {
      id: orderId,
    },
  });

  if (!order) {
    throw new NotFoundError("Order not found");
  }

  // Check if payment already exists for this order
  const existingPayment = await prismaClient.payment.findUnique({
    where: {
      orderId,
    },
  });

  if (existingPayment) {
    throw new StatusError({
      status: StatusCodes.CONFLICT,
      message: "Payment already exists for this order",
    });
  }

  // Create the payment
  const payment = await prismaClient.payment.create({
    data: {
      userId,
      orderId,
      imageId,
      amount,
    },
  });

  return payment;
};

const getPaymentById = async (id: number) => {
  const payment = await prismaClient.payment.findUnique({
    where: {
      id,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      image: true,
      order: true,
    },
  });

  if (!payment) {
    throw new NotFoundError("Payment not found");
  }

  return payment;
};

/**
 * Get payment by order ID
 */
const getPaymentByOrderId = async (orderId: number) => {
  const payment = await prismaClient.payment.findUnique({
    where: {
      orderId,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      image: true,
      order: true,
    },
  });

  if (!payment) {
    throw new NotFoundError("Payment not found for this order");
  }

  return payment;
};

/**
 * Get all payments (with pagination)
 */
const getAllPayments = async (page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    prismaClient.payment.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        image: true,
        order: true,
      },
    }),
    prismaClient.payment.count(),
  ]);

  return {
    data: payments,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get all payments by user ID (with pagination)
 */
const getPaymentsByUserId = async (
  userId: number,
  page: number = 1,
  limit: number = 10,
) => {
  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    prismaClient.payment.findMany({
      where: {
        userId,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        image: true,
        order: true,
      },
    }),
    prismaClient.payment.count({
      where: {
        userId,
      },
    }),
  ]);

  return {
    data: payments,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const PaymentService = {
  createPayment,
  getPaymentById,
  getPaymentByOrderId,
  getAllPayments,
  getPaymentsByUserId,
};

export default PaymentService;
