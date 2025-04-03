import { z } from "zod";
import prismaClient from "../database";
import {
  SearchUsersBody,
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

const getMe = async (sessionToken: string) => {
  const user = await getUserBySessionToken(sessionToken);

  return user;
};

const updateMe = async (sessionToken: string, data: UpdateMeBodyType) => {
  const user = await getUserBySessionToken(sessionToken);

  const updatedUser = await prismaClient.user.update({
    where: {
      id: user.id,
    },
    data,
  });

  return updatedUser;
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
    data,
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
  searchBody: z.TypeOf<typeof SearchUsersBody>,
) => {
  const preparedWhereCondition = [
    {
      id: searchBody.id,
    },
    {
      email: {
        contains: searchBody.email,
      },
    },
    {
      firstName: {
        contains: searchBody.name,
      },
    },
    {
      lastName: {
        contains: searchBody.name,
      },
    },
    {
      role: searchBody.role,
    },
  ];
  const [users, totalLength] = await Promise.all([
    prismaClient.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      where: {
        AND: preparedWhereCondition,
      },
    }),
    prismaClient.user.count({
      where: {
        AND: preparedWhereCondition,
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

const UserService = {
  getMe,
  updateMe,
  updatePassword,
  getUserById,
  updateUserById,
  getAllUsers,
  deleteUserById,
};
export default UserService;
