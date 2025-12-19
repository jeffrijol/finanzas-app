export function parseExcelDate(value: any): Date | null {
    if (value instanceof Date) {
        return value;
    }

    // Excel date numbers
    if (typeof value === 'number') {
        // Excel stores dates as number of days since Jan 1, 1900
        // Subtract 25569 to convert to Unix Epoch (Jan 1, 1970)
        // Multiply by 86400 * 1000 to convert days to milliseconds
        return new Date((value - 25569) * 86400 * 1000);
    }

    if (typeof value === 'string') {
        // Attempt standard parse
        const timestamp = Date.parse(value);
        if (!isNaN(timestamp)) {
            return new Date(timestamp);
        }

        // Attempt DD/MM/YYYY or DD-MM-YYYY
        const parts = value.split(/[\/\-]/);
        if (parts.length === 3) {
            // Assuming DD/MM/YYYY
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);
            const date = new Date(year, month, day);
            if (!isNaN(date.getTime())) {
                return date;
            }
        }
    }

    return null;
}
