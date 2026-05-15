const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    await prisma.note.count();
    console.log("Notes count OK");
    await prisma.aISummary.count();
    console.log("AISummary count OK");
    await prisma.tag.count();
    console.log("Tags count OK");
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

test();
