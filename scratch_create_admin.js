import prisma from "./lib/prisma.js";
import bcrypt from "bcrypt";

async function createAdmin() {
  const email = "admin@gmail.com";
  const password = "Admin@123";
  const name = "Admin User";

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'admin',
        isEmailVerified: true
      }
    });

    console.log("Admin user created successfully:");
    console.log(`Email: ${admin.email}`);
    console.log(`Password: ${password}`);
  } catch (error) {
    if (error.code === 'P2002') {
      console.log("Admin user already exists or email is taken.");
    } else {
      console.error("Error creating admin:", error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
