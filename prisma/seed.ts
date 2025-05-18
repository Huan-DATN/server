import { OrderStatusType, PrismaClient } from "@prisma/client";
import * as fs from "fs";
import { hashPassword } from "./../src/utils/crypto";

const prisma = new PrismaClient();

async function importGroupProductFromFile(filePath: string) {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const lines = fileContent.split("\n");

  for (const line of lines) {
    const name = line;
    if (name) {
      await prisma.groupProduct.create({
        data: {
          name: name.trim(),
        },
      });
    }
  }
}

async function importCategoriesFromFile(filePath: string) {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const lines = fileContent.split("\n");

  for (const line of lines) {
    const name = line;
    if (name) {
      await prisma.category.create({
        data: {
          name: name.trim(),
        },
      });
    }
  }
}

async function importCitiesFromFile(filePath: string) {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const lines = fileContent.split("\n");

  for (const line of lines) {
    const name = line;
    if (name) {
      await prisma.city.create({
        data: {
          name: name.trim(),
        },
      });
    }
  }
}

async function main() {
  // Delete all data to reset the database

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
      shopName: `Shop ${i + 1}`,
      address: `Address ${i + 1}`,
      phone: `0909090909`,
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
  await importGroupProductFromFile("./prisma/data/groupsProduct.txt");
  await importCategoriesFromFile("./prisma/data/categories.txt");
  await importCitiesFromFile("./prisma/data/cities.txt");

  // Create Products
  const groupProducts = await prisma.groupProduct.findMany();
  const categories = await prisma.category.findMany();
  const cities = await prisma.city.findMany();
  const usersDB = await prisma.user.findMany();

  for (let i = 0; i < 900; i++) {
    const randomGroupProduct =
      groupProducts[Math.floor(Math.random() * groupProducts.length)];
    const randomCategory =
      categories[Math.floor(Math.random() * categories.length)];
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    const randomUser = usersDB[Math.floor(Math.random() * usersDB.length)];
    await prisma.product.create({
      data: {
        name: `Product ${i + 1}`,
        description: `Description for Product ${i + 1}`,
        price: (Math.floor(Math.random() * 100) + 1) * 1000,
        quantity: Math.floor(Math.random() * 100) + 1,
        groupProductId: randomGroupProduct.id,
        cityId: randomCity.id,
        userId: randomUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        categories: {
          connect: {
            id: randomCategory.id,
          },
        },
        images: {
          create: [
            {
              publicUrl: `https://picsum.photos/200/300?random=${i + 1}`,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        },
      },
    });
  }

  // Create Status
  const orderStatus = [
    { name: "PENDING" },
    { name: "CONFIRMED" },
    { name: "PROCESSING" },
    { name: "SHIPPED" },
    { name: "DELIVERED" },
    { name: "CANCELLED" },
    { name: "RETURNED" },
    { name: "FAILED" },
  ];
  for (const status of orderStatus) {
    await prisma.status.create({
      data: {
        type: status.name as OrderStatusType,
        name: status.name,
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
