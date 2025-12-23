import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { Transaction } from '@/types';

interface ReportOptions {
    title: string;
    subtitle: string;
    transactions: Transaction[];
    chartIds: string[]; // IDs de los elementos DOM de gráficos a capturar
}

export const PdfGeneratorService = {
    async generateDashboardReport({ title, subtitle, transactions, chartIds }: ReportOptions) {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        let currentY = 20;

        // --- Header ---
        doc.setFontSize(22);
        doc.text('Finanzas App', 14, currentY);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generado: ${new Date().toLocaleDateString()}`, pageWidth - 14, currentY, { align: 'right' });

        currentY += 15;

        // --- Title & Subtitle ---
        doc.setFontSize(16);
        doc.setTextColor(0);
        doc.text(title, 14, currentY);

        currentY += 7;
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(subtitle, 14, currentY);

        currentY += 15;

        // --- Charts Capture ---
        // Iteramos los gráficos y los añadimos como imágenes
        for (const id of chartIds) {
            const element = document.getElementById(id);
            if (element) {
                try {
                    const canvas = await html2canvas(element, { scale: 2 });
                    const imgData = canvas.toDataURL('image/png');

                    // Ajustar tamaño imagen al ancho PDF (con margen)
                    const imgWidth = pageWidth - 28;
                    const imgHeight = (canvas.height * imgWidth) / canvas.width;

                    // Si no cabe, nueva página
                    if (currentY + imgHeight > doc.internal.pageSize.height - 20) {
                        doc.addPage();
                        currentY = 20;
                    }

                    doc.addImage(imgData, 'PNG', 14, currentY, imgWidth, imgHeight);
                    currentY += imgHeight + 10;
                } catch (err) {
                    console.error(`Error capturing chart ${id}`, err);
                }
            }
        }

        // --- Transactions Table ---
        if (currentY > doc.internal.pageSize.height - 60) {
            doc.addPage();
            currentY = 20;
        } else {
            currentY += 10; // Espacio antes de la tabla
        }

        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text('Detalle de Transacciones', 14, currentY);
        currentY += 5;

        const tableBody = transactions.map(t => [
            new Date(t.fechaValor).toLocaleDateString(),
            t.categoria || 'Sin categoría',
            t.descripcion,
            t.itemAsignado?.nombre || '-',
            new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(t.importe)
        ]);

        autoTable(doc, {
            startY: currentY,
            head: [['Fecha', 'Categoría', 'Descripción', 'Item', 'Importe']],
            body: tableBody,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [16, 185, 129] }, // Emerald header
            alternateRowStyles: { fillColor: [248, 250, 252] },
            margin: { top: 20 },
            didDrawPage: (data) => {
                // Footer page number?
            }
        });

        // Save
        doc.save(`reporte_financiero_${new Date().getTime()}.pdf`);
    }
};
