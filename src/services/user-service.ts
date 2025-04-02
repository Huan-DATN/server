import prismaClient from "../database";
import {
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

const UserService = { getMe, updateMe, updatePassword };
export default UserService;
