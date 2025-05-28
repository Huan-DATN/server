import { OrderStatusType, PrismaClient } from "@prisma/client";
import csv from "csv-parser";
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

async function importProductsFromCSV(filePath: string) {
  const products: any[] = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => {
        products.push(data);
      })
      .on("end", async () => {
        try {
          const groupProducts = await prisma.groupProduct.findMany();
          const categories = await prisma.category.findMany();
          const cities = await prisma.city.findMany();
          const sellers = await prisma.user.findMany({
            where: { role: "SELLER" },
          });

          for (const product of products) {
            // Find or create city based on product origin
            let city = cities.find((c) => c.name === product["Xuất xứ"]);
            if (!city && product["Xuất xứ"]) {
              city = await prisma.city.create({
                data: {
                  name: product["Xuất xứ"],
                },
              });
              cities.push(city);
            }

            // Randomly select a group product
            const randomGroupProduct =
              groupProducts[Math.floor(Math.random() * groupProducts.length)];

            // Randomly select 1-3 categories
            const numCategories = Math.floor(Math.random() * 3) + 1;
            const selectedCategories: any[] = [];

            for (let i = 0; i < numCategories; i++) {
              const randomCategory =
                categories[Math.floor(Math.random() * categories.length)];
              if (!selectedCategories.includes(randomCategory)) {
                selectedCategories.push(randomCategory);
              }
            }

            // Select a random seller
            const randomSeller =
              sellers[Math.floor(Math.random() * sellers.length)];

            // Calculate price based on product rating (stars)
            const starRating = parseInt(product["Số sao"]) || 3;
            const basePrice = 50000 + starRating * 20000; // Higher star rating = higher price
            const randomPriceFactor = 0.8 + Math.random() * 0.4; // Random factor between 0.8 and 1.2
            const price =
              Math.round((basePrice * randomPriceFactor) / 1000) * 1000; // Round to nearest 1000

            // Create the product
            await prisma.product.create({
              data: {
                name: product["Tên sản phẩm"],
                description:
                  product["Mô tả"] ||
                  `Sản phẩm ${product["Tên sản phẩm"]} từ ${
                    product["Xuất xứ"] || "Việt Nam"
                  }`,
                price: price,
                star: starRating,
                quantity: Math.floor(Math.random() * 100) + 10,
                groupProductId: randomGroupProduct.id,
                cityId: city?.id || cities[0].id,
                userId: randomSeller.id,
                categories: {
                  connect: selectedCategories.map((category) => ({
                    id: category.id,
                  })),
                },
                images: {
                  create: [
                    {
                      publicUrl: `https://picsum.photos/400/300?random=${Math.floor(
                        Math.random() * 1000,
                      )}`,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                    },
                  ],
                },
              },
            });
          }
          resolve(products.length);
        } catch (error) {
          reject(error);
        }
      })
      .on("error", (error) => {
        reject(error);
      });
  });
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

  // Import products from CSV
  try {
    console.log("Importing products from CSV...");
    const productCount = await importProductsFromCSV(
      "./prisma/data/product_data.csv",
    );
    console.log(`Successfully imported ${productCount} products from CSV`);
  } catch (error) {
    console.error("Error importing products from CSV:", error);
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
