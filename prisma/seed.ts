import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const employees = [
    {
      id: "EMP16654529",
      name: "Clement Peiris",
      designation: "Operations Executive",
      email: "clement.s@company.com",
      active: true,
      role: "admin",
      username: "clement",
      passwordHash:
        "$2a$12$X3.bF.VKJ8EPwRlMP/KIgOMOxA1yUV3vxbYYTnP3qq1rbrAOEPdlW",
      department: "operations",
    },
    {
      id: "EMP16847599",
      name: "T.G. Tharindu",
      designation: "Assistant Operations",
      email: "tgtharindu@company.com",
      active: true,
      role: "dataEntry",
      username: "lop09",
      passwordHash:
        "$2a$12$X3.bF.VKJ8EPwRlMP/KIgOMOxA1yUV3vxbYYTnP3qq1rbrAOEPdlW",
      department: null,
    },
  ];

  for (const employee of employees) {
    await prisma.employee.upsert({
      where: {
        id: employee.id,
      },
      update: employee,
      create: employee,
    });
  }

  console.log(`Seeded ${employees.length} employees.`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
