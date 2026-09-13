import { PrismaClient } from "@prisma/client";
import { resetAndSeed } from "../src/lib/seedData";

const prisma = new PrismaClient();

resetAndSeed(prisma)
  .then((result) => console.log("Seed complete:", result))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
