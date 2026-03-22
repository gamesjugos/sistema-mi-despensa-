const ExcelJS = require('exceljs');
const path = require('path');

async function analyzeExcel() {
    const filePath = 'c:\\Users\\Jesus Ruiz\\Desktop\\mi despensa\\vikingos-dashboard\\NOMINA MD 2026 MD FEBRERO -.xlsx';
    console.log(`Analyzing file: ${filePath}`);

    const workbook = new ExcelJS.Workbook();
    try {
        await workbook.xlsx.readFile(filePath);
        console.log(`\nWorkbook has ${workbook.worksheets.length} worksheets.`);

        workbook.worksheets.forEach((sheet) => {
            console.log(`\n--- Sheet: ${sheet.name} ---`);
            console.log(`Total Rows: ${sheet.rowCount}`);
            console.log(`Total Columns: ${sheet.columnCount}`);

            // Print the first 15 rows to understand the structure
            const rowCountToPrint = Math.min(sheet.rowCount, 15);
            for (let i = 1; i <= rowCountToPrint; i++) {
                const row = sheet.getRow(i);
                if (row.values && row.values.length > 0) {
                    console.log(`Row ${i}:`, JSON.stringify(row.values));
                }
            }
        });
    } catch (error) {
        console.error('Error reading the Excel file:', error.message);
    }
}

analyzeExcel();
