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
  await prisma.categoryProduct.deleteMany();
  await prisma.user.deleteMany();
  await prisma.session.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

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
    await prisma.category.create({
      data: {
        name,
      },
    });
  }

  // Create 200 products
  const numberProduct = 200;
  const products: any[] = [];

  for (let i = 0; i < numberProduct; i++) {
    products.push({
      name: `Product ${i + 1}`,
      description: `Description for product ${i + 1}`,
      quantity: Math.floor(Math.random() * 100) + 1,
      price: Math.floor(Math.random() * 10000) + 1,
      image: `https://placehold.co/600x400/png`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Assign random users to products
  const usersInDb = await prisma.user.findMany({
    where: {
      role: "SELLER",
    },
  });
  for (const product of products) {
    const randomUser = usersInDb[Math.floor(Math.random() * usersInDb.length)];
    product.userId = randomUser.id;
  }

  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }

  // Create category-product relationships
  const productsInDb = await prisma.product.findMany();
  const categoriesInDb = await prisma.category.findMany();
  const categoryProductData: any[] = [];
  for (const product of productsInDb) {
    const randomCategory =
      categoriesInDb[Math.floor(Math.random() * categoriesInDb.length)];
    categoryProductData.push({
      productId: product.id,
      categoryId: randomCategory.id,
    });
  }
  for (const data of categoryProductData) {
    await prisma.categoryProduct.create({
      data,
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
