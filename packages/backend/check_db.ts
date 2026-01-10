import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const itemTypes = await prisma.itemType.count();
    const items = await prisma.item.count();
    const categories = await prisma.transactionCategory.count();

    console.log(`ItemTypes: ${itemTypes}`);
    console.log(`Items: ${items}`);
    console.log(`Categories: ${categories}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
