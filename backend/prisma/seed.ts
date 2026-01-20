import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Début du seeding...');

    const adminExists = await prisma.user.findFirst({
        where: { role: 'ADMIN' }
    });

    if (adminExists) {
        console.log('✅ Un administrateur existe déjà. Seeding ignoré.');
        return;
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@test.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const admin = await prisma.user.create({
        data: {
            email: adminEmail,
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'System',
            phone: '+22890000000',
            role: 'ADMIN',
        },
    });

    console.log(`✅ Administrateur créé avec succès:`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Rôle: ${admin.role}`);

    const vehicles = await prisma.vehicle.createMany({
        data: [
            {
                brand: 'Toyota',
                model: 'Corolla 2023',
                licensePlate: 'TG-1234-AB',
                isAvailable: true,
            },
            {
                brand: 'Honda',
                model: 'Civic 2022',
                licensePlate: 'TG-5678-CD',
                isAvailable: true,
            },
            {
                brand: 'Hyundai',
                model: 'Tucson 2023',
                licensePlate: 'TG-9012-EF',
                isAvailable: true,
            },
        ],
    });

    console.log(`✅ ${vehicles.count} véhicules créés avec succès.`);
    console.log('\n🎉 Seeding terminé avec succès!');
}

main()
    .catch((e) => {
        console.error('❌ Erreur lors du seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
