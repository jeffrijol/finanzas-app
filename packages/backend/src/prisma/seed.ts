// packages/backend/src/prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando seed de la base de datos...');

    // 1. Limpiar datos existentes en el orden correcto (por las relaciones)
    await prisma.transaction.deleteMany({});
    await prisma.excelUpload.deleteMany({});
    await prisma.transactionCategory.deleteMany({});
    await prisma.item.deleteMany({});
    await prisma.itemType.deleteMany({});

    console.log('🗑️ Datos anteriores eliminados');

    // 1.5 Crear Tipos de Items
    const itemTypeInmueble = await prisma.itemType.create({
        data: {
            name: 'Inmueble',
            code: 'INMUEBLE',
            description: 'Propiedades inmobiliarias'
        }
    });

    const itemTypeFinanciero = await prisma.itemType.create({
        data: {
            name: 'Financiero',
            code: 'FINANCIERO',
            description: 'Cuentas, fondos y otros productos financieros'
        }
    });

    console.log('✅ Tipos de items creados');

    // 2. Crear los ítems
    const itemsData = [
        {
            nombre: 'Casa 1',
            descripcion: 'Primera propiedad inmobiliaria',
            color: '#3B82F6',
            icono: '🏠',
            activo: true,
            itemTypeId: itemTypeInmueble.id
        },
        {
            nombre: 'Casa 2',
            descripcion: 'Segunda propiedad inmobiliaria',
            color: '#10B981',
            icono: '🏡',
            activo: true,
            itemTypeId: itemTypeInmueble.id
        },
        {
            nombre: 'Inversión 3',
            descripcion: 'Primera inversión financiera',
            color: '#8B5CF6',
            icono: '📈',
            activo: true,
            itemTypeId: itemTypeFinanciero.id
        },
        {
            nombre: 'Inversión 4',
            descripcion: 'Segunda inversión financiera',
            color: '#F59E0B',
            icono: '💰',
            activo: true,
            itemTypeId: itemTypeFinanciero.id
        }
    ];

    for (const itemData of itemsData) {
        await prisma.item.create({
            data: itemData
        });
    }

    console.log('✅ Ítems creados: Casa 1, Casa 2, Inversión 3, Inversión 4');

    // 3. Crear un registro de ExcelUpload simulado
    const excelUpload = await prisma.excelUpload.create({
        data: {
            filename: 'seed_data.xlsx',
            fileSize: 10240,
            totalRows: 90,
            processed: true,
            errors: null
        }
    });


    console.log('📄 Registro de ExcelUpload creado');

    // 4. Obtener todos los ítems para asignarlos a transacciones
    const allItems = await prisma.item.findMany();

    // 5. Función para generar fecha aleatoria dentro de un mes
    const randomDateInMonth = (year: number, month: number): Date => {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0);
        const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        // Asegurar que sea a las 00:00:00 como en el Excel
        randomDate.setHours(0, 0, 0, 0);
        return randomDate;
    };

    // 6. Tipos de transacciones basados en el Excel
    const transactionTypes = [
        { clave: '100', categoria: 'Transferencias', descripcion: 'Transf/avanze capital gestion' },
        { clave: '108', categoria: 'Transferencias', descripcion: 'Transf interna/marta' },
        { clave: 'A07', categoria: 'Recibos', descripcion: 'Recib/comunidad de propietarios' },
        { clave: 'A07', categoria: 'Recibos', descripcion: 'Recib/telefonica moviles españa' },
        { clave: 'A07', categoria: 'Recibos', descripcion: 'Recib/securitas direct españa' },
        { clave: '100', categoria: 'Transferencias', descripcion: 'Trans/canirun inversiones scr' },
        { clave: '570', categoria: 'Otros', descripcion: 'Conversión divisas' },
        { clave: '100', categoria: 'Transferencias', descripcion: 'Transf otras/tendam retail sa' },
        { clave: '100', categoria: 'Transferencias', descripcion: 'Trans/juan antonio barcia alb' }
    ];

    // 7. Generar transacciones de enero a septiembre (2025)
    const transactions = [];
    const year = 2025;

    for (let month = 1; month <= 9; month++) {
        // Entre 8 y 12 transacciones por mes
        const transactionsPerMonth = Math.floor(Math.random() * 5) + 8;

        for (let i = 0; i < transactionsPerMonth; i++) {
            const fechaValor = randomDateInMonth(year, month);

            // Seleccionar tipo aleatorio
            const tipo = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];

            // Generar referencia aleatoria
            const referencia = Math.floor(Math.random() * 900) + 100;

            // Determinar si es ingreso o gasto (40% ingresos, 60% gastos)
            const esIngreso = Math.random() > 0.6;

            // Generar importe (basado en patrones del Excel)
            let importe: number;

            if (tipo.clave === '100' && tipo.descripcion.includes('inversiones')) {
                importe = esIngreso ?
                    (Math.random() > 0.5 ? 5279.0 : 2761.56) :
                    -(Math.random() > 0.5 ? 87500.0 : 17500.0);
            } else if (tipo.categoria === 'Recibos') {
                const recibos = [122.08, 137.08, 188.81, 37.0, 36.09, 36.13, 7.9, 202.69, 46.09, 7.92, 303.47];
                importe = -recibos[Math.floor(Math.random() * recibos.length)];
            } else if (tipo.clave === '108') {
                importe = esIngreso ?
                    (Math.random() > 0.5 ? 2468.96 : 1411.43) :
                    -309.55;
            } else if (tipo.clave === '570') {
                importe = 0.25;
            } else {
                importe = esIngreso ?
                    (Math.random() * 10000) + 1000 :
                    -(Math.random() * 5000) + 100;
            }

            // Redondear a 2 decimales
            importe = Math.round(importe * 100) / 100;

            // Seleccionar ítem aleatorio (pero con más probabilidad para ciertos tipos)
            let itemIndex;
            if (tipo.categoria === 'Recibos') {
                // Recibos más probables para Casas
                itemIndex = Math.random() > 0.3 ?
                    Math.floor(Math.random() * 2) : // Casa 1 o Casa 2
                    Math.floor(Math.random() * 4); // Cualquiera
            } else if (tipo.descripcion.includes('inversiones')) {
                // Inversiones más probables para Inversión 3 o 4
                itemIndex = Math.random() > 0.3 ?
                    Math.floor(Math.random() * 2) + 2 : // Inversión 3 o 4
                    Math.floor(Math.random() * 4); // Cualquiera
            } else {
                itemIndex = Math.floor(Math.random() * allItems.length);
            }

            const item = allItems[itemIndex];

            // Crear metadata con datos adicionales
            const metadata = {
                clave: tipo.clave,
                referencia: referencia.toString(),
                descripcionCompleta: `${tipo.descripcion} - Ref: ${referencia}`,
                tipo: esIngreso ? 'ingreso' : 'gasto',
                generadoPor: 'seed',
                fechaGeneracion: new Date().toISOString()
            };

            transactions.push({
                fechaValor,
                categoria: tipo.categoria,
                descripcion: `${tipo.descripcion.substring(0, 50)}...`, // Limitar longitud
                importe,
                saldo: 0, // Se calculará después
                itemAsignadoId: item.id,
                metadata: JSON.stringify(metadata),
                excelUploadId: excelUpload.id
            });
        }
    }

    // 8. Ordenar transacciones por fecha (más antigua primero)
    transactions.sort((a, b) => a.fechaValor.getTime() - b.fechaValor.getTime());

    // 9. Calcular saldos acumulados
    // Saldo inicial simulado (ajustado para que al final sea realista)
    let saldoActual = 1500000.0; // Saldo inicial simulado en enero

    for (let i = 0; i < transactions.length; i++) {
        saldoActual += transactions[i].importe;
        transactions[i].saldo = Math.round(saldoActual * 100) / 100;
    }

    console.log(`📊 Generadas ${transactions.length} transacciones simuladas`);
    console.log(`💰 Saldo inicial: 1,500,000.00`);
    console.log(`💰 Saldo final: ${transactions[transactions.length - 1]?.saldo.toLocaleString('es-ES')}`);

    // 10. Insertar transacciones en la base de datos (uno a uno para evitar problemas con createMany en SQLite)
    for (const txData of transactions) {
        await prisma.transaction.create({
            data: txData
        });
    }
    console.log(`✅ ${transactions.length} transacciones insertadas`);

    // 11. Actualizar el ExcelUpload con el número real de filas
    await prisma.excelUpload.update({
        where: { id: excelUpload.id },
        data: { totalRows: transactions.length }
    });

    console.log('🎉 Seed completado exitosamente!');
    console.log('📊 Resumen:');
    console.log(`   - Ítems creados: ${allItems.length}`);
    console.log(`   - Transacciones creadas: ${transactions.length}`);
    console.log(`   - Período cubierto: Enero 2025 - Septiembre 2025`);
}

main()
    .catch((e) => {
        console.error('❌ Error durante el seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });