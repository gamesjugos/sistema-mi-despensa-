import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetPasswords() {
    try {
        const hashedPassword = await bcrypt.hash('123456', 10);
        await prisma.user.updateMany({
            data: {
                password: hashedPassword
            }
        });
        console.log("Todas las contraseñas han sido restablecidas a '123456'");
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

resetPasswords();
