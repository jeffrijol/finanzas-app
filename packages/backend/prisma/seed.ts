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

    // 1. Limpiar BD
    await prisma.transaction.deleteMany();
    await prisma.item.deleteMany();
    await prisma.excelUpload.deleteMany();
    console.log('✅ Base de datos limpia.');

    // 2. Crear Items
    const createdItems: any[] = [];

    // Mapeo de Tipo Backend -> Tipo Visual si es necesario, 
    // pero guardaremos en BD el TIPO EXACTO.
    // Ojo: Frontend espera 'BIENES_INMUEBLES' e 'INVERSIONES'.
    // Si cambio los strings, debo cambiar frontend.
    // El usuario pidió "1-Inmueble, 2-Inversión, 3-Avanze Sociedad".
    // Usaremos strings UPPERCASE snake_case para consistencia en BD: 'INMUEBLE', 'INVERSION', 'AVANZE_SOCIEDAD'.
    // Y tocará adaptar frontend.

    for (const [tipo, config] of Object.entries(SEED_STRUCTURE)) {
        for (const nombreItem of config.items) {
            const item = await prisma.item.create({
                data: {
                    nombre: nombreItem,
                    tipo: tipo, // 'INMUEBLE', 'INVERSION', etc.
                    color: config.color,
                    icono: config.icono,
                    descripcion: `Item de tipo ${tipo}`,
                    activo: true
                }
            });
            createdItems.push(item);
        }
    }
    console.log(`✅ Items creados: ${createdItems.length}`);

    // 3. Leer Excel Real
    // Ruta absoluta o relativa al root del repo. 
    // Estamos en packages/backend/prisma/seed.ts -> root es ../../..
    const excelPath = path.resolve(__dirname, '../../../Movimientos_cuenta T1.xlsx');

    if (!fs.existsSync(excelPath)) {
        console.error(`❌ No se encontró el archivo Excel en: ${excelPath}`);
        process.exit(1);
    }

    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convertir a array de arrays para procesar manualmente
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

    // Buscar fila de cabecera
    let headerIndex = -1;
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (row.includes('FECHA VALOR') || row.includes('DESCRIPCIÓN')) {
            headerIndex = i;
            break;
        }
    }

    if (headerIndex === -1) {
        throw new Error('No se encontró la cabecera "FECHA VALOR" o "DESCRIPCIÓN" en el Excel');
    }

    console.log(`✅ Cabecera encontrada en fila ${headerIndex}`);

    // Mapear Columnas (asumiendo orden standard del banco si no varió)
    // Buscamos índices por nombre
    const headerRow = rows[headerIndex];
    const idxFecha = headerRow.findIndex((c: any) => c && c.toString().includes('FECHA VALOR'));
    const idxDesc = headerRow.findIndex((c: any) => c && c.toString().includes('DESCRIPCIÓN'));
    const idxCat = headerRow.findIndex((c: any) => c && c.toString().includes('CATEGORÍA'));
    // Importe a veces es "IMPORTES" o hay DEBE/HABER/SALDO.
    // En el dump vi "Saldo disponible" con valor -138.93 y "267959.39" como header.
    // El dump json de sheet_to_json automático usó la fila anterior.
    // En `header: 1`, probablemente veamos columnas como "IMPORTE" o "SALDO DISPONIBLE".
    // Buscaré columna con numéricos.
    // Usaremos la columna que tenga 'IMPORTE' en header row o 'Saldo disponible' si existe.
    let idxImporte = headerRow.findIndex((c: any) => c && (c.toString().includes('IMPORTE') || c.toString().includes('Saldo disponible')));

    // Si no encuentra 'IMPORTE', buscamos en las siguientes filas donde haya números.
    if (idxImporte === -1) {
        // Fallback: buscar columna H o I (7 u 8)
        idxImporte = 7; // Aprox segun dump
    }

    console.log(`Indices detectados: Fecha=${idxFecha}, Desc=${idxDesc}, Importe=${idxImporte}`);

    // 4. Crear Transacciones
    const dataRows = rows.slice(headerIndex + 1);
    const transactionsToInsert = [];

    // Helper excel date
    const excelDateToJSDate = (serial: number) => {
        return new Date(Math.round((serial - 25569) * 86400 * 1000));
    };

    // Crear un registro Upload Dummy
    const upload = await prisma.excelUpload.create({
        data: {
            filename: 'Movimientos_cuenta T1.xlsx',
            fileSize: fs.statSync(excelPath).size,
            totalRows: dataRows.length,
            processed: true
        }
    });

    let count = 0;
    for (const row of dataRows) {
        // Validar que sea fila válida
        if (!row[idxFecha] && !row[idxDesc]) continue;

        let fechaValor: Date;
        if (typeof row[idxFecha] === 'number') {
            fechaValor = excelDateToJSDate(row[idxFecha]);
        } else {
            // Try parse string
            fechaValor = new Date(row[idxFecha]);
        }

        if (isNaN(fechaValor.getTime())) continue; // Skip invalid dates

        const descripcion = row[idxDesc] || 'Sin descripción';
        const categoria = row[idxCat] || 'General';
        const importe = typeof row[idxImporte] === 'number' ? row[idxImporte] : parseFloat(row[idxImporte] || '0');

        if (importe === 0 && !row[idxImporte]) continue; // Skip empty rows

        // ASIGNACIÓN ALEATORIA
        // Seleccionar un item random de la lista creada
        const randomItem = createdItems[Math.floor(Math.random() * createdItems.length)];

        transactionsToInsert.push({
            fechaValor,
            descripcion,
            categoria, // Podríamos mapear categorías, pero usaremos la del banco por ahora
            importe,
            itemAsignadoId: randomItem.id,
            excelUploadId: upload.id,
            saldo: 0, // se calcula despues
            metadata: JSON.stringify({ autoSeeded: true })
        });
        count++;
    }

    // Ordenar por fecha
    transactionsToInsert.sort((a, b) => a.fechaValor.getTime() - b.fechaValor.getTime());

    // Calcular saldos acumulados (ficticio inicial ??? o basado en excel?)
    // El excel tiene columna SALDO, pero vamos a recalcular simulando.
    let saldo = 0;
    for (const t of transactionsToInsert) {
        saldo += t.importe;
        t.saldo = Number(saldo.toFixed(2));
    }

    // Insertar
    for (const t of transactionsToInsert) {
        await prisma.transaction.create({ data: t });
    }

    console.log(`🎉 Seed completado. ${transactionsToInsert.length} transacciones importadas y asignadas.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
