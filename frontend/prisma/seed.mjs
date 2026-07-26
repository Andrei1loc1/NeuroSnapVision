import { PrismaClient } from "@prisma/client";
import { existsSync, readFileSync } from "node:fs";

if (!process.env.DATABASE_URL && existsSync(".env")) {
  const envFile = readFileSync(".env", "utf8");
  const databaseUrl = envFile
    .split(/\r?\n/)
    .find((line) => line.trim().startsWith("DATABASE_URL="));

  if (databaseUrl) {
    process.env.DATABASE_URL = databaseUrl
      .split(/=(.*)/s)[1]
      ?.trim()
      .replace(/^"|"$/g, "");
  }
}

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
});

const foods = [
  { slug: "pizza", name: "Pizza", calories: 700, proteinGrams: 28, carbsGrams: 80, fatGrams: 30 },
  { slug: "omelette", name: "Omelette", calories: 400, proteinGrams: 25, carbsGrams: 5, fatGrams: 28 },
  { slug: "hamburger", name: "Hamburger", calories: 650, proteinGrams: 32, carbsGrams: 45, fatGrams: 35 },
  { slug: "french_fries", name: "French Fries", calories: 430, proteinGrams: 5, carbsGrams: 55, fatGrams: 22 },
  { slug: "caesar_salad", name: "Caesar Salad", calories: 350, proteinGrams: 18, carbsGrams: 20, fatGrams: 22 },
  { slug: "chicken_curry", name: "Chicken Curry", calories: 650, proteinGrams: 45, carbsGrams: 55, fatGrams: 25 },
  { slug: "fried_rice", name: "Fried Rice", calories: 600, proteinGrams: 18, carbsGrams: 90, fatGrams: 18 },
  { slug: "spaghetti_bolognese", name: "Spaghetti Bolognese", calories: 620, proteinGrams: 28, carbsGrams: 75, fatGrams: 18 },
  { slug: "sushi", name: "Sushi", calories: 450, proteinGrams: 24, carbsGrams: 65, fatGrams: 10 },
  { slug: "pancakes", name: "Pancakes", calories: 520, proteinGrams: 12, carbsGrams: 85, fatGrams: 16 },
];

async function main() {
  for (const food of foods) {
    await prisma.food.upsert({
      where: { slug: food.slug },
      update: food,
      create: food,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
