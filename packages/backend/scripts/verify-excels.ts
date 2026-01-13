
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

// Paths provided by the user (assuming relative to the project root d:\desarrollo\finanzas-app)
const masterFile = 'd:\\desarrollo\\finanzas-app\\Movimientos_cuenta T1.xlsx';
const splitFiles = [
    'd:\\desarrollo\\finanzas-app\\Movimientos_cuenta_T1_Enero.xlsx',
    'd:\\desarrollo\\finanzas-app\\Movimientos_cuenta_T1_Febrero.xlsx',
    'd:\\desarrollo\\finanzas-app\\Movimientos_cuenta_T1_Marzo.xlsx'
];

interface TransactionRow {
    [key: string]: any;
}

function readExcel(filePath: string): TransactionRow[] {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Read as array of arrays first to find the real header
    const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

    // Find the header row. Look for "Fecha" or "F. Valor" or "Fecha Valor"
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(20, rawData.length); i++) {
        const row = rawData[i];
        // Check if row has some expected columns
        const rowStr = row.map(c => String(c).toLowerCase()).join(' ');
        if (rowStr.includes('fecha') && rowStr.includes('importe')) {
            headerRowIndex = i;
            break;
        }
    }

    if (headerRowIndex === -1) {
        // If no header found, maybe it's clean? Return default
        return XLSX.utils.sheet_to_json(sheet, { defval: null });
    }

    // Capture headers
    const headers = rawData[headerRowIndex].map(h => String(h).trim());

    // Parse subsequent rows into objects
    const result: TransactionRow[] = [];
    for (let i = headerRowIndex + 1; i < rawData.length; i++) {
        const row = rawData[i];
        if (!row || row.length === 0) continue;

        const obj: TransactionRow = {};
        headers.forEach((h, index) => {
            if (h) {
                obj[h] = row[index];
            }
        });

        // Filter out empty rows (sometimes footer like "Total:" exists)
        // A valid transaction row should have at least a date and amount
        // Check fuzzy keys
        const normKeys = Object.keys(obj).map(k => k.toLowerCase());
        const dateKey = Object.keys(obj).find(k => k.toLowerCase().includes('fecha'));
        const amountKey = Object.keys(obj).find(k => k.toLowerCase().includes('importe') || k.toLowerCase().includes('cantidad'));

        // Check if values exist and are reasonably valid
        const dateVal = dateKey ? obj[dateKey] : null;
        const amountVal = amountKey ? obj[amountKey] : null;

        // Skip rows where date matches header (just in case) or looks like "Información..."
        if (dateVal && amountVal !== undefined && amountVal !== null &&
            String(dateVal).toLowerCase() !== 'fecha contable' &&
            !String(dateVal).toLowerCase().includes('información')) {
            result.push(obj);
        }
    }

    return result;
}

// Function to generate a unique key for comparison (to handle potential minor differences)
// Assuming common columns based on context: Fecha, Descripcion, Importe/Saldo
// We need to be careful with exact content matching.
function generateKey(row: TransactionRow): string {
    // Normalize date strings if possible, but raw comparison might be safer if files are copies.
    // Let's try to grab typical fields. Adjust these property names based on actual file content if needed.
    // Common mappings in this app: 'F. Valor', 'Fecha', 'Descripción', 'Importe', etc.
    // We'll dump a row to console to see keys if this fails, but let's try a generic approach first.

    // Normalize keys to lowercase to avoid case issues
    const normalizedRow: any = {};
    Object.keys(row).forEach(k => {
        normalizedRow[k.trim().toLowerCase()] = row[k];
    });

    // Construct a signature. 
    // Usually: date + description + amount is unique enough.
    // If not, we might have duplicates in the same day/desc/amount combo (rare but possible).
    // Better to just count occurrences of each signature.

    // Identify likely columns
    // Check for Excel serial date numbers vs strings.
    // 'Fecha' column in Excel usually comes as serial number (e.g. 45322) or string.
    let date = normalizedRow['f. valor'] || normalizedRow['fecha'] || normalizedRow['fecha valor'];

    // DEBUG: Print keys if date is missing to see what we have
    if (date === undefined) {
        // console.log('DEBUG KEYS:', Object.keys(normalizedRow));
    }

    // Simple normalization for Excel serial dates if needed, or just toString comparison.
    // Often master file might have dates formatted differently than split files if they were saved differently.
    // Let's rely on Excel parser's default behavior but ensuring consistent string representation.
    if (typeof date === 'number') {
        // Excel base date is 1899-12-30
        const dateObj = new Date(Math.round((date - 25569) * 86400 * 1000));
        // Format as DD/MM/YYYY to match typical string format
        const day = dateObj.getUTCDate().toString().padStart(2, '0');
        const month = (dateObj.getUTCMonth() + 1).toString().padStart(2, '0');
        const year = dateObj.getUTCFullYear();
        date = `${day}/${month}/${year}`;
    } else if (typeof date === 'string') {
        // Try to normalize string dates to standard format if inconsistent (e.g. 1/1/2025 vs 01/01/2025)
        // But for now let's assume if it's string it's consistent within the files or we just use it as is.
        // If master has "01-01-2025" and split has "45681", now they should match.
    }

    const desc = normalizedRow['descripción'] || normalizedRow['descripcion'] || normalizedRow['concepto'];

    // Handle floating point precision issues for amounts
    let amount = normalizedRow['importe'] || normalizedRow['cantidad'] || normalizedRow['monto'];
    if (typeof amount === 'number') {
        amount = amount.toFixed(2);
    }

    let balance = normalizedRow['saldo'] || normalizedRow['balance'];
    if (typeof balance === 'number') {
        balance = balance.toFixed(2);
    }

    return `${date}|${desc}|${amount}|${balance}`;
}

function normalizeRows(rows: TransactionRow[]): string[] {
    return rows.map(generateKey);
}

function log(msg: string) {
    console.log(msg);
    fs.appendFileSync('verify-report.txt', msg + '\n');
}

function verify() {
    if (fs.existsSync('verify-report.txt')) fs.unlinkSync('verify-report.txt');

    log(`Reading Master File: ${masterFile}`);
    const masterRows = readExcel(masterFile);
    log(`Master Rows: ${masterRows.length}`);
    if (masterRows.length > 0) {
        log('Sample Master Row Keys (Raw): ' + JSON.stringify(Object.keys(masterRows[0])));
        const norm: any = {};
        Object.keys(masterRows[0]).forEach(k => norm[k.trim().toLowerCase()] = true);
        log('Sample Master Row Keys (Normalized): ' + JSON.stringify(Object.keys(norm)));
    }

    let totalSplitRows = 0;
    let allSplitRows: TransactionRow[] = [];

    for (const file of splitFiles) {
        log(`Reading Split File: ${file}`);
        const rows = readExcel(file);
        log(`- Rows: ${rows.length}`);
        if (rows.length > 0) {
            const norm: any = {};
            Object.keys(rows[0]).forEach(k => norm[k.trim().toLowerCase()] = true);
            log(`Sample Split Row Keys (${path.basename(file)}): ` + JSON.stringify(Object.keys(norm)));
        }
        totalSplitRows += rows.length;
        allSplitRows = allSplitRows.concat(rows);
    }

    log(`Total Split Rows: ${totalSplitRows}`);

    // Map signatures to counts
    const masterCounts = new Map<string, number>();
    masterRows.forEach(r => {
        const key = generateKey(r);
        masterCounts.set(key, (masterCounts.get(key) || 0) + 1);
    });

    const splitCounts = new Map<string, number>();
    allSplitRows.forEach(r => {
        const key = generateKey(r);
        splitCounts.set(key, (splitCounts.get(key) || 0) + 1);
    });

    // Comparison
    let match = true;

    log(`\n--- Summary ---`);
    log(`Master File Rows: ${masterRows.length}`);
    log(`Total Split Rows: ${totalSplitRows}`);

    if (masterRows.length !== totalSplitRows) {
        log('❌ Row count mismatch!');
        match = false;
    } else {
        log('✅ Row count matches.');
    }

    // Check Master vs Split
    let mismatchCount = 0;
    for (const [key, count] of masterCounts) {
        const splitCount = splitCounts.get(key) || 0;
        if (count !== splitCount) {
            log(`❌ Mismatch for signature: [${key}]`);
            log(`   Master: ${count}, Split: ${splitCount}`);
            // Find one example row from master
            const example = masterRows.find(r => generateKey(r) === key);
            log('   Example Master Row: ' + JSON.stringify(example));
            match = false;
            mismatchCount++;
            if (mismatchCount > 5) break;
        }
    }

    // Check for extra rows in Split
    mismatchCount = 0;
    for (const [key, count] of splitCounts) {
        if (!masterCounts.has(key)) {
            log(`❌ Extra row in Split files: [${key}]`);
            // Find example from split
            const example = allSplitRows.find(r => generateKey(r) === key);
            log('   Example Split Row: ' + JSON.stringify(example));
            if (example) {
                log('   Example Split Row Keys: ' + JSON.stringify(Object.keys(example)));
                log('   Generated Key: ' + generateKey(example));
            }
            match = false;
            mismatchCount++;
            if (mismatchCount > 5) break;
        }
    }

    if (match) {
        log('\n🎉 SUCCESS: The content of the 3 split files EXACTLY matches the master file.');
    } else {
        log('\n⚠️ FAILURE: Differences found.');
    }
}

verify();
