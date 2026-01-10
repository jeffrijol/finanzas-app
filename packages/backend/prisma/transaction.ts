// comando desde la raiz del proyecto: cd packages/backend && npx tsx prisma/transaction.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting deletion of Transactions and ExcelUploads...');

    try {
        // Delete Transactions first because they reference ExcelUploads
        const deletedTransactions = await prisma.transaction.deleteMany({});
        console.log(`Deleted ${deletedTransactions.count} transactions.`);

        // Then delete ExcelUploads
        const deletedExcelUploads = await prisma.excelUpload.deleteMany({});
        console.log(`Deleted ${deletedExcelUploads.count} excel uploads.`);

        console.log('Deletion completed successfully.');
    } catch (error) {
        console.error('Error deleting data:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
