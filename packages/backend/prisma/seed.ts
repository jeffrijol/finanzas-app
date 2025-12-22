import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando seed híbrido de la base de datos...');

    // 1. Limpiar datos existentes
    await prisma.transaction.deleteMany();
    await prisma.item.deleteMany();
    await prisma.excelUpload.deleteMany();

    console.log('✅ Datos existentes eliminados');

    // 2. Crear Items de tipo BIENES_INMUEBLES
    const bienesInmuebles = await Promise.all([
        prisma.item.create({
            data: {
                nombre: 'Vivienda Principal',
                descripcion: 'Gastos de vivienda principal',
                tipo: 'BIENES_INMUEBLES',
                color: '#3B82F6',
                icono: '🏠',
                activo: true,
            },
        }),
        prisma.item.create({
            data: {
                nombre: 'Local Comercial',
                descripcion: 'Ingresos y gastos de local comercial',
                tipo: 'BIENES_INMUEBLES',
                color: '#10B981',
                icono: '🏪',
                activo: true,
            },
        }),
        prisma.item.create({
            data: {
                nombre: 'Terreno',
                descripcion: 'Inversión en terrenos',
                tipo: 'BIENES_INMUEBLES',
                color: '#8B5CF6',
                icono: '🏞️',
                activo: true,
            },
        }),
        prisma.item.create({
            data: {
                nombre: 'Apartamento Alquiler',
                descripcion: 'Apartamento para alquilar',
                tipo: 'BIENES_INMUEBLES',
                color: '#F59E0B',
                icono: '🏢',
                activo: true,
            },
        }),
    ]);

    console.log(`✅ Creados ${bienesInmuebles.length} items de Bienes Inmuebles`);

    // 3. Crear Items de tipo INVERSIONES
    const inversiones = await Promise.all([
        prisma.item.create({
            data: {
                nombre: 'Acciones Apple',
                descripcion: 'Inversión en bolsa de valores',
                tipo: 'INVERSIONES',
                color: '#EF4444',
                icono: '📈',
                activo: true,
            },
        }),
        prisma.item.create({
            data: {
                nombre: 'Fondo Indexado SP500',
                descripcion: 'Fondos mutuos y ETFs',
                tipo: 'INVERSIONES',
                color: '#06B6D4',
                icono: '💼',
                activo: true,
            },
        }),
        prisma.item.create({
            data: {
                nombre: 'Bitcoin',
                descripcion: 'Cartera fría',
                tipo: 'INVERSIONES',
                color: '#F97316',
                icono: '₿',
                activo: true,
            },
        }),
        prisma.item.create({
            data: {
                nombre: 'Bonos del Estado',
                descripcion: 'Bonos a 10 años',
                tipo: 'INVERSIONES',
                color: '#14B8A6',
                icono: '📊',
                activo: true,
            },
        }),
        prisma.item.create({
            data: {
                nombre: 'Depósito Plazo Fijo',
                descripcion: 'Banco Santander',
                tipo: 'INVERSIONES',
                color: '#6366F1',
                icono: '🏦',
                activo: true,
            },
        }),
        prisma.item.create({
            data: {
                nombre: 'Urbanitae',
                descripcion: 'Crowdfunding Inmobiliario',
                tipo: 'INVERSIONES',
                color: '#EC4899',
                icono: '👥',
                activo: true,
            },
        }),
    ]);

    console.log(`✅ Creados ${inversiones.length} items de Inversiones`);

    // 3b. Crear Item General (Catch-all)
    const itemOtros = await prisma.item.create({
        data: {
            nombre: 'Otros Gastos/Ingresos',
            descripcion: 'Movimientos generales sin categoría específica',
            // Usaremos 'BIENES_INMUEBLES' (como gastos de vida) para general
            tipo: 'BIENES_INMUEBLES',
            color: '#9CA3AF',
            icono: '📝',
            activo: true,
        },
    });

    // Añadir al pool
    const allItems = [...bienesInmuebles, ...inversiones, itemOtros];

    // 4. Crear un registro de ExcelUpload simulado
    const excelUpload = await prisma.excelUpload.create({
        data: {
            filename: 'seed_masivo_2025.xlsx',
            fileSize: 25000,
            totalRows: 0,
            processed: true,
            errors: null
        }
    });

    // 5. Configuración para generación de transacciones
    const randomDateInMonth = (year: number, month: number): Date => {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0);
        const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        randomDate.setHours(0, 0, 0, 0);
        return randomDate;
    };

    const transactionTypes = [
        { clave: '100', categoria: 'Transferencias', descripcion: 'Transf/avanze capital gestion' },
        { clave: '108', categoria: 'Transferencias', descripcion: 'Transf interna/marta' },
        { clave: 'A07', categoria: 'Recibos', descripcion: 'Recib/comunidad de propietarios' },
        { clave: 'A07', categoria: 'Recibos', descripcion: 'Recib/telefonica moviles españa' },
        { clave: 'A07', categoria: 'Recibos', descripcion: 'Recib/securitas direct españa' },
        { clave: '100', categoria: 'Transferencias', descripcion: 'Trans/canirun inversiones scr' },
        { clave: '570', categoria: 'Otros', descripcion: 'Conversión divisas' },
        { clave: '100', categoria: 'Transferencias', descripcion: 'Transf otras/tendam retail sa' },
        { clave: '100', categoria: 'Transferencias', descripcion: 'Trans/juan antonio barcia alb' },
        { clave: 'BUY', categoria: 'Inversiones', descripcion: 'Compra de activos' },
        { clave: 'DIV', categoria: 'Inversiones', descripcion: 'Cobro de dividendos' },
        { clave: 'RENT', categoria: 'Alquiler', descripcion: 'Cobro de alquiler mensual' }
    ];

    const transactions = [];
    const year = 2025;
    let saldoActual = 150000.0; // Saldo inicial

    // Generar transacciones de Enero a Diciembre
    for (let month = 1; month <= 12; month++) {
        // Generar entre 15 y 30 transacciones por mes para tener volumen
        const transactionsPerMonth = Math.floor(Math.random() * 15) + 15;

        for (let i = 0; i < transactionsPerMonth; i++) {
            const fechaValor = randomDateInMonth(year, month);
            const tipo = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
            const referencia = Math.floor(Math.random() * 9000) + 1000;
            const esIngreso = Math.random() > 0.6; // 40% ingresos

            let importe: number;
            let itemAsignadoId: string | null = null;
            let categoria = tipo.categoria;

            // Lógica de asignación inteligente
            if (tipo.descripcion.includes('Inversiones') || tipo.clave === 'BUY' || tipo.clave === 'DIV') {
                // Asignar a Inversiones
                const item = inversiones[Math.floor(Math.random() * inversiones.length)];
                itemAsignadoId = item.id;
                categoria = 'Inversiones';

                if (tipo.clave === 'DIV') {
                    importe = (Math.random() * 500) + 50; // Dividendo
                } else if (tipo.clave === 'BUY') {
                    importe = -((Math.random() * 2000) + 500); // Compra
                } else {
                    importe = esIngreso ? (Math.random() * 1000) : -(Math.random() * 1000);
                }

            } else if (tipo.descripcion.includes('Recibos') || tipo.descripcion.includes('comunidad')) {
                // Asignar a Bienes Inmuebles
                const item = bienesInmuebles[Math.floor(Math.random() * bienesInmuebles.length)];
                itemAsignadoId = item.id;
                categoria = 'Servicios';
                importe = -((Math.random() * 300) + 50); // Gastos de casa

            } else if (tipo.clave === 'RENT') {
                // Ingreso de alquiler (Apartamento)
                const item = bienesInmuebles.find(b => b.nombre.includes('Apartamento')) || bienesInmuebles[0];
                itemAsignadoId = item.id;
                categoria = 'Ingresos';
                importe = 850.00; // Alquiler fijo

            } else {
                // Otros gastos/ingresos generales
                // Asignar aleatoriamente o al item 'Otros'
                if (Math.random() > 0.5) {
                    itemAsignadoId = allItems[Math.floor(Math.random() * allItems.length)].id;
                } else {
                    itemAsignadoId = itemOtros.id;
                }

                importe = esIngreso ?
                    (Math.random() * 3000) + 100 :
                    -((Math.random() * 500) + 20);
            }

            // GARANTIZAR ASIGNACIÓN: Si por alguna razón es null, asignar a Otros
            if (!itemAsignadoId) {
                itemAsignadoId = itemOtros.id;
            }

            importe = Math.round(importe * 100) / 100;

            const metadata = {
                clave: tipo.clave,
                referencia: referencia.toString(),
                tipo: importe > 0 ? 'ingreso' : 'gasto',
                autoGenerated: true
            };

            transactions.push({
                fechaValor,
                categoria,
                descripcion: tipo.descripcion,
                importe,
                saldo: 0, // Se calcula después
                itemAsignadoId,
                metadata: JSON.stringify(metadata),
                excelUploadId: excelUpload.id
            });
        }
    }

    // Ordenar y calcular saldos
    transactions.sort((a, b) => a.fechaValor.getTime() - b.fechaValor.getTime());

    transactions.forEach(t => {
        saldoActual += t.importe;
        t.saldo = Math.round(saldoActual * 100) / 100;
    });

    console.log(`📊 Generadas ${transactions.length} transacciones para 2025`);

    // Insertar en lotes
    for (const tx of transactions) {
        await prisma.transaction.create({ data: tx });
    }

    // Actualizar upload
    await prisma.excelUpload.update({
        where: { id: excelUpload.id },
        data: { totalRows: transactions.length }
    });

    console.log('🎉 Seed Híbrido completado!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
