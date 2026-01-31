import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando Seed Multi-Tenant...');

    // 1. Limpiar BD
    console.log('🧹 Limpiando base de datos...');
    await prisma.transaction.deleteMany();
    await prisma.transactionCategory.deleteMany();
    await prisma.item.deleteMany();
    await prisma.itemType.deleteMany();
    await prisma.excelUpload.deleteMany();
    await prisma.member.deleteMany();
   await prisma.organization.deleteMany();
    console.log('✅ Base de datos limpia.');

    // 2. Crear Organización y Usuario de Prueba
    console.log('👤 Creando organización y usuario de prueba...');
    
    // ID de usuario hardcodeado (en producción vendría de Supabase Auth)
    const testUserId = '00000000-0000-0000-0000-000000000001';
    
    // Crear organización de prueba
    const testOrg = await prisma.organization.create({
        data: {
            name: 'Organización de Prueba',
            slug: 'organizacion-de-prueba',
            ownerUserId: testUserId  // camelCase
        }
    });
    
    // Crear rol admin si no existe
    let adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
    if (!adminRole) {
        adminRole = await prisma.role.create({
            data: {
                id: 'admin',  // ID explícito
                name: 'admin',
                description: 'Administrator with full access',
                permissions: JSON.stringify(['*'])
            }
        });
    }
    
    // Crear Member (asociar usuario con organización)
    await prisma.member.create({
        data: {
            userId: testUserId,          // camelCase
            organizationId: testOrg.id,  // camelCase
            roleId: adminRole.id         // camelCase
        }
    });
    
    console.log(`✅ Organización creada: ${testOrg.name} (ID: ${testOrg.id})`);

    // 3. Definir Tipos y Categorías
    const ITEM_TYPES_CONFIG = {
        INMUEBLE: {
            name: 'Inmueble',
            items: ['Castelar', 'Lealtad', 'R. de la Cruz', 'M. Silvela', 'Fco. de Sales'],
            color: '#3B82F6',
            icono: '🏢',
            categories: {
                INCOME: ['Alquiler', 'Otros Ingresos'],
                EXPENSE: ['IBI', 'Comunidad', 'Seguro', 'Mantenimiento', 'Otros Gastos']
            }
        },
        INVERSION: {
            name: 'Inversión',
            items: ['Canirún', 'Inversión Avanze'],
            color: '#10B981',
            icono: '📈',
            categories: {
                INCOME: ['Abono intereses', 'Dividendos', 'Traspasos', 'Otros Ingresos'],
                EXPENSE: ['Llamada', 'Comisiones', 'Otros Gastos']
            }
        },
        AVANZE_SOCIEDAD: {
            name: 'Avanze Sociedad',
            items: ['Avanze Gastos', 'Retribuciones', 'Impuestos'],
            color: '#8B5CF6',
            icono: '💼',
            categories: {
                INCOME: ['Otros Ingresos'],
                EXPENSE: ['Recibos espacio', 'Gestoría', 'Gastos extras', 'IVA', 'Retención', 'Sociedades', 'Otros Gastos']
            }
        }
    };

    // 4. Crear Tipos, Categorías e Items
    const createdItems: any[] = [];
    const itemMap = new Map<string, { typeId: string, typeCode: string }>();
    const categoryMap = new Map<string, { INCOME: any[], EXPENSE: any[] }>();

    for (const [code, config] of Object.entries(ITEM_TYPES_CONFIG)) {
        // Crear Tipo
        const itemType = await prisma.itemType.create({
            data: {
                name: config.name,
                code: code,
                description: `Tipo destinado a ${config.name}`
            }
        });

        // Crear Categorías para este Tipo
        const incomeCats = [];
        for (const catName of config.categories.INCOME) {
            const cat = await prisma.transactionCategory.create({
                data: { 
                    name: catName, 
                    type: 'INCOME', 
                    itemTypeId: itemType.id,
                    organizationId: testOrg.id,
                    userId: testUserId
                }
            });
            incomeCats.push(cat);
        }

        const expenseCats = [];
        for (const catName of config.categories.EXPENSE) {
            const cat = await prisma.transactionCategory.create({
                data: { 
                    name: catName, 
                    type: 'EXPENSE', 
                    itemTypeId: itemType.id,
                    organizationId: testOrg.id,
                    userId: testUserId
                }
            });
            expenseCats.push(cat);
        }

        categoryMap.set(code, { INCOME: incomeCats, EXPENSE: expenseCats });

        // Crear Items
        for (const nombreItem of config.items) {
            const item = await prisma.item.create({
                data: {
                    nombre: nombreItem,
                    itemTypeId: itemType.id,
                    color: config.color,
                    icono: config.icono,
                    descripcion: `Item de tipo ${config.name}`,
                    activo: true,
                    organizationId: testOrg.id,
                    userId: testUserId
                }
            });
            createdItems.push(item);
            itemMap.set(item.id, { typeId: itemType.id, typeCode: code });
        }
    }
    console.log(`✅ Estructura creada: ${createdItems.length} items y sus tipos/categorías para organización ${testOrg.name}.`);

    console.log('🎉 Seed finalizado con éxito.');
    console.log('');
    console.log('📝 Credenciales de prueba:');
    console.log(`   User ID: ${testUserId}`);
    console.log(`   Organization ID: ${testOrg.id}`);
    console.log(`   Organization Name: ${testOrg.name}`);
    console.log('');
    console.log('⚠️  NOTA: El usuario con ID hardcodeado debe existir en Supabase Auth.');
    console.log('   Puedes crear este usuario manualmente o actualizar el seed con un UUID real.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
