const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const userId = "664539130000000000000000"; // Dummy ObjectId
    const count = await prisma.aISummary.count({
      where: { note: { userId } }
    });
    console.log("Count:", count);
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

test();
