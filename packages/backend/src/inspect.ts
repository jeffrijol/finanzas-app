
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const byMonth = await prisma.transaction.groupBy({
        by: ['fechaValor'],
        where: {
            fechaValor: {
                gte: new Date(2025, 0, 1),
                lte: new Date(2025, 11, 31)
            }
        },
        _count: { id: true },
    });

    const months: Record<number, number> = {};
    byMonth.forEach(t => {
        const m = t.fechaValor.getMonth() + 1; // 1-12
        months[m] = (months[m] || 0) + t._count.id;
    });

    console.log('--- Transactions by Month (2025) ---');
    // Sort by month
    Object.keys(months).sort((a, b) => Number(a) - Number(b)).forEach(k => {
        console.log(`Month ${k}: ${months[Number(k)]} txs`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
