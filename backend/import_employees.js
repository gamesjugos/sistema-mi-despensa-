const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function importData() {
    try {
        const data = fs.readFileSync('employees_backup.json', 'utf8');
        const employees = JSON.parse(data);

        console.log(`Restoring ${employees.length} employees...`);

        // We clean up dates to make them valid prisma Dates, and add new fields
        const formatted = employees.map(emp => ({
            id: emp.id,
            nombre: emp.nombre,
            apellido: emp.apellido,
            cedula: `V-${Math.floor(Math.random() * 90000000) + 10000000}`, // random cedula like V-24355201
            sueldoMensual: 0,
            cargo: emp.cargo,
            fechaIngreso: new Date(emp.fechaIngreso),
            fechaEgreso: emp.fechaEgreso ? new Date(emp.fechaEgreso) : null,
            empresa: emp.empresa,
            isActive: emp.isActive,
            createdAt: new Date(emp.createdAt),
            updatedAt: new Date(emp.updatedAt)
        }));

        const result = await prisma.employee.createMany({
            data: formatted,
            skipDuplicates: true
        });

        console.log(`Done! Inserted ${result.count}`);
    } catch (e) {
        console.error('Error importing:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

importData();
