import prisma from "./lib/prisma.js";

async function checkAdmins() {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'admin' },
      select: { email: true, name: true }
    });

    if (admins.length === 0) {
      console.log("No admin users found in the database.");
    } else {
      console.log("Admin Users Found:");
      admins.forEach(admin => {
        console.log(`- ${admin.name} (${admin.email})`);
      });
    }
  } catch (error) {
    console.error("Error checking admins:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmins();
