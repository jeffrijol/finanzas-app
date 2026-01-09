import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ReportOptions {
    title: string;
    subtitle: string;
    chartIds: string[]; // IDs de los elementos DOM de gráficos a capturar
}

export const PdfGeneratorService = {
    async generateDashboardReport({ title, subtitle, chartIds }: ReportOptions) {
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

        // Save
        doc.save(`reporte_financiero_${new Date().getTime()}.pdf`);
    }
};
