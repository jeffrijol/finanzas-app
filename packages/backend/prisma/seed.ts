import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

const prisma = new PrismaClient();

// Definición de Estructura Solicitada
const SEED_STRUCTURE = {
    INMUEBLE: {
        color: '#3B82F6', // Blue
        icono: '🏢',
        items: ['Castelar', 'Lealtad', 'R. de la Cruz', 'M. Silvela', 'Fco. de Sales']
    },
    INVERSION: {
        color: '#10B981', // Emerald/Green
        icono: '📈',
        items: ['Canirún', 'Inversión Avanze']
    },
    AVANZE_SOCIEDAD: {
        color: '#8B5CF6', // Violet/Purple
        icono: '💼',
        items: ['Avanze Gastos', 'Retribuciones', 'Impuestos']
    }
};

async function main() {
    console.log('🌱 Iniciando Seed Final con Datos Reales...');

    // 0. Utils
    const createSlug = (str: string) => str.toUpperCase().replace(/\s+/g, '_');

    // 1. Limpiar BD
    console.log('🧹 Limpiando base de datos...');
    await prisma.transaction.deleteMany();
    await prisma.transactionCategory.deleteMany();
    await prisma.item.deleteMany();
    await prisma.itemType.deleteMany();
    await prisma.excelUpload.deleteMany();
    console.log('✅ Base de datos limpia.');

    // 2. Definir Tipos y Categorías
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
            name: 'Inversión', // Visual
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
                EXPENSE: ['Factura espacio', 'Gestoría', 'Gastos extras', 'IVA', 'Retención', 'Sociedad', 'Otros Gastos']
            }
        }
    };

    // 3. Crear Tipos, Categorías e Items
    const createdItems: any[] = [];
    // Cache para buscar IDs rápido durante el seeding de transacciones
    // itemID -> { typeId, typeCode }
    const itemMap = new Map<string, { typeId: string, typeCode: string }>();
    // typeCode -> { INCOME: cat[], EXPENSE: cat[] } (guardamos IDs)
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
                data: { name: catName, type: 'INCOME', itemTypeId: itemType.id }
            });
            incomeCats.push(cat);
        }

        const expenseCats = [];
        for (const catName of config.categories.EXPENSE) {
            const cat = await prisma.transactionCategory.create({
                data: { name: catName, type: 'EXPENSE', itemTypeId: itemType.id }
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
                    activo: true
                }
            });
            createdItems.push(item);
            itemMap.set(item.id, { typeId: itemType.id, typeCode: code });
        }
    }
    console.log(`✅ Estructura creada: ${createdItems.length} items y sus tipos/categorías.`);

    // 4. Leer Excel de Movimientos
    /*
    const excelPath = path.resolve(__dirname, '../../../Movimientos_cuenta T1.xlsx');
    if (!fs.existsSync(excelPath)) {
        console.error(`❌ No se encontró Excel: ${excelPath}`);
        process.exit(1);
    }

    const workbook = XLSX.readFile(excelPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

    // Buscar cabecera
    let headerIndex = -1;
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (row.includes('FECHA VALOR') || row.includes('DESCRIPCIÓN')) {
            headerIndex = i;
            break;
        }
    }
    if (headerIndex === -1) throw new Error('Cabecera no encontrada');

    const headerRow = rows[headerIndex];
    const idxFecha = headerRow.findIndex((c: any) => c && c.toString().includes('FECHA VALOR'));
    const idxDesc = headerRow.findIndex((c: any) => c && c.toString().includes('DESCRIPCIÓN'));
    // cat banco
    const idxCatBanco = headerRow.findIndex((c: any) => c && c.toString().includes('CATEGORÍA'));
    // importe
    let idxImporte = headerRow.findIndex((c: any) => c && (c.toString().includes('IMPORTE') || c.toString().includes('Saldo disponible')));
    if (idxImporte === -1) idxImporte = 7; // fallback

    // 5. Procesar Transacciones
    const dataRows = rows.slice(headerIndex + 1);
    const transactionsToInsert = [];

    // Crear Upload log
    const upload = await prisma.excelUpload.create({
        data: {
            filename: 'Movimientos_cuenta T1.xlsx',
            fileSize: fs.statSync(excelPath).size,
            totalRows: dataRows.length,
            processed: true
        }
    });

    const excelDateToJSDate = (serial: number) => new Date(Math.round((serial - 25569) * 86400 * 1000));

    for (const row of dataRows) {
        if (!row[idxFecha] && !row[idxDesc]) continue;

        let fechaValor: Date;
        if (typeof row[idxFecha] === 'number') fechaValor = excelDateToJSDate(row[idxFecha]);
        else fechaValor = new Date(row[idxFecha]);

        if (isNaN(fechaValor.getTime())) continue;

        const descripcion = row[idxDesc] || 'Sin descripción';
        const categoriaBanco = row[idxCatBanco] || 'General';
        const importe = typeof row[idxImporte] === 'number' ? row[idxImporte] : parseFloat(row[idxImporte] || '0');

        if (importe === 0 && !row[idxImporte]) continue;

        // --- ASIGNACIÓN INTELIGENTE (SIMULADA) ---
        // 1. Asignar Item Random
        const randomItem = createdItems[Math.floor(Math.random() * createdItems.length)];
        const itemInfo = itemMap.get(randomItem.id);

        // 2. Determinar si es Ingreso o Gasto
        const esIngreso = importe > 0;
        const group = esIngreso ? 'INCOME' : 'EXPENSE';

        // 3. Buscar posibles categorías internas para ese Tipo de Item
        let categoryId = null;
        if (itemInfo) {
            const availableCats = categoryMap.get(itemInfo.typeCode)?.[group] || [];
            if (availableCats.length > 0) {
                // Seleccionar categoría random de las disponibles conf el plan
                const randomCat = availableCats[Math.floor(Math.random() * availableCats.length)];
                categoryId = randomCat.id;
            }
        }

        transactionsToInsert.push({
            fechaValor,
            descripcion,
            categoria: categoriaBanco,
            importe,
            saldo: 0,
            itemAsignadoId: randomItem.id,
            categoryId: categoryId, // <--- Nueva relación
            excelUploadId: upload.id,
            metadata: JSON.stringify({ autoSeeded: true })
        });
    }

    // Ordenar y Saldos
    transactionsToInsert.sort((a, b) => a.fechaValor.getTime() - b.fechaValor.getTime());
    let saldo = 0;
    for (const t of transactionsToInsert) {
        saldo += t.importe;
        t.saldo = Number(saldo.toFixed(2));
    }

    // Insertar (usamos loop para validar FKs, o createMany si estamos seguros)
    // createMany es más rápido
    // SQLite createMany support is recent/standard now? Yes on prisma.
    // Pero si hay error en uno, falla todo. Loop con Promise.allbatches es mejor si son muchos.
    // Son ~1000 items?
    console.log(`Insertando ${transactionsToInsert.length} transacciones...`);

    // Chunking para no saturar
    for (const t of transactionsToInsert) {
        await prisma.transaction.create({ data: t });
    }
    */

    console.log('🎉 Seed finalizado con éxito.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
