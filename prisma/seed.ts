import { PrismaClient } from "@prisma/client";
import { hashPassword } from "./../src/utils/crypto";
const prisma = new PrismaClient();

const categories = [
  "Mắm tôm",
  "Gốm sứ",
  "Gạo",
  "Trà thảo dược",
  "Thực phẩm chức năng",
  "Hạt sen sấy",
  "Kẹo dừa",
];

async function main() {
  // Delete all existing data
  await prisma.user.deleteMany();
  await prisma.session.deleteMany();
  await prisma.userAddress.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();

  await prisma.orderItem.deleteMany();
  await prisma.cartItem.deleteMany();

  // Create 11 Users: Include 5 users with role "USER", 5 users with role "BUYER", and 1 "ADMIN"
  const hashedPasswordDefault = await hashPassword("123123");
  const users: any[] = [];

  for (let i = 0; i < 5; i++) {
    users.push({
      email: `user${i + 1}@example.com`,
      firstName: `User ${i + 1}`,
      role: "BUYER",
      password: hashedPasswordDefault,
    });
  }

  for (let i = 0; i < 5; i++) {
    users.push({
      email: `seller${i + 1}@example.com`,
      firstName: `Seller ${i + 1}`,
      role: "SELLER",
      password: hashedPasswordDefault,
    });
  }

  users.push({
    email: "admin@example.com",
    firstName: "Admin",
    role: "ADMIN",
    password: hashedPasswordDefault,
  });

  for (const user of users) {
    await prisma.user.create({
      data: user,
    });
  }

  // Create categories
  for (const name of categories) {
    await prisma.productCategory.create({
      data: {
        name,
        description: `Description for ${name}`,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
