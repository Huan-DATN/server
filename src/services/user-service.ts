import prismaClient from "../database";
import { PaginationReqType } from "../schemaValidations/common.schema";
import { CreateUserType } from "../schemaValidations/request/user";
import { ShopsListResType } from "../schemaValidations/response/user";
import {
  SearchUserQueryType,
  UpdateMeBodyType,
  UpdatePasswordBodyType,
} from "../schemaValidations/user.schema";
import { comparePassword, hashPassword } from "../utils/crypto";
import { EntityError } from "../utils/errors";

const getUserBySessionToken = async (sessionToken: string) => {
  const session = await prismaClient.session.findUnique({
    where: {
      token: sessionToken,
    },
    include: {
      user: true,
    },
  });
  if (!session) {
    throw new EntityError([
      {
        field: "sessionToken",
        message: "Session Token is invalid",
      },
    ]);
  }
  return session.user;
};

const getMe = async (userId: number) => {
  const user = await prismaClient.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      image: true,
    },
  });

  return user;
};

const updateMe = async (userId: number, data: UpdateMeBodyType) => {
  const user = await prismaClient.user.update({
    where: {
      id: userId,
    },
    data: {
      ...data,
      image: data.image
        ? {
            connect: { id: data.image.id },
          }
        : undefined,
    },
  });

  return user;
};

const updatePassword = async (
  sessionToken: string,
  { oldPassword, newPassword }: UpdatePasswordBodyType,
) => {
  const user = await getUserBySessionToken(sessionToken);

  if (await comparePassword(user.password, oldPassword)) {
    throw new EntityError([
      {
        field: "oldPassword",
        message: "Old password is incorrect",
      },
    ]);
  }

  const updatedUser = await prismaClient.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: await hashPassword(newPassword),
    },
  });

  return updatedUser;
};

const getUserById = async (id: number) => {
  const user = await prismaClient.user.findUnique({
    where: {
      id,
    },
    include: {
      image: true,
    },
  });
  if (!user) {
    throw new EntityError([
      {
        field: "userId",
        message: "User not found",
      },
    ]);
  }
  return user;
};

const updateUserById = async (id: number, data: UpdateMeBodyType) => {
  const user = await prismaClient.user.update({
    where: {
      id,
    },
    data: {
      ...data,
      image: data.image
        ? {
            connect: { id: data.image.id },
          }
        : undefined,
    },
  });
  if (!user) {
    throw new EntityError([
      {
        field: "userId",
        message: "User not found",
      },
    ]);
  }
  return user;
};

const getAllUsers = async (
  {
    page = 1,
    limit = 10,
  }: {
    page: number;
    limit: number;
  },
  searchBody: SearchUserQueryType,
  {
    orderBy = "createdAt",
    order = "desc",
  }: {
    orderBy: string;
    order: string;
  },
) => {
  const preparedWhereCondition = [
    {
      id: searchBody.id,
    },
    {
      email: {
        contains: searchBody.search,
      },
    },
    {
      firstName: {
        contains: searchBody.search,
      },
    },
    {
      lastName: {
        contains: searchBody.search,
      },
    },
    {
      role: searchBody.role,
    },
    {
      isActive:
        searchBody.isActive !== undefined ? searchBody.isActive : undefined,
    },
  ];

  const [users, totalLength] = await Promise.all([
    prismaClient.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [orderBy]: order,
      },
      where: {
        OR: preparedWhereCondition,
      },
      include: {
        image: true,
      },
    }),
    prismaClient.user.count({
      where: {
        OR: preparedWhereCondition,
      },
    }),
  ]);

  const totalUsers = totalLength;
  const totalPages = Math.ceil(totalLength / limit);
  return {
    users,
    totalUsers,
    totalPages,
  };
};

const deleteUserById = async (id: number) => {
  const user = await prismaClient.user.delete({
    where: {
      id,
    },
  });
  if (!user) {
    throw new EntityError([
      {
        field: "userId",
        message: "User not found",
      },
    ]);
  }
  return user;
};

// #region getShops
const getShops = async (
  { page, limit }: PaginationReqType,
  isActive: boolean = true,
) => {
  const [shops, totalShops] = await Promise.all([
    prismaClient.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      where: {
        AND: [
          {
            role: {
              equals: "SELLER",
            },
          },
          {
            isActive,
          },
        ],
      },
      select: {
        id: true,
        shopName: true,
        address: true,
        image: true,
        _count: {
          select: {
            Product: true,
          },
        },
      },
    }),
    prismaClient.user.count({
      where: {
        AND: [
          {
            role: {
              equals: "SELLER",
            },
          },
          {
            isActive,
          },
        ],
      },
    }),
  ]);

  const formattedShops: ShopsListResType["data"] = shops.map((shop) => ({
    id: shop.id,
    shopName: shop.shopName ?? "Unknown Shop Name",
    address: shop.address ?? "Unknown Address",
    productsTotal: shop._count.Product,
    image: shop.image
      ? {
          id: shop.image.id,
          publicUrl: shop.image.publicUrl,
        }
      : null,
  }));

  const totalPages = Math.ceil(totalShops / limit);

  return {
    formattedShops,
    totalShops,
    totalPages,
  };
};

const createUser = async (data: CreateUserType) => {
  const userData = { ...data };

  // Create user with image if provided
  const user = await prismaClient.user.create({
    data: {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: await hashPassword(userData.password),
      phone: userData.phone,
      address: userData.address,
      shopName: userData.shopName,
      role: userData.role,
      isActive: userData.isActive,
      ...(userData.imageId
        ? { image: { connect: { id: userData.imageId } } }
        : {}),
    },
    include: {
      image: true,
    },
  });

  return user;
};

const UserService = {
  getMe,
  updateMe,
  updatePassword,
  getUserById,
  updateUserById,
  getAllUsers,
  deleteUserById,
  getShops,
  createUser,
};
export default UserService;
