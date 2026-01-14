import html2canvas from 'html2canvas';
import { buildDashboardPDF } from './pdf-generator/pdf-builder';

interface ReportOptions {
    title: string;
    subtitle: string;
    chartIds: string[];
    data: any; // Data for the report content
    stackedChartId?: string; // Specific ID for the stacked chart if present
}

export const PdfGeneratorService = {
    async generateDashboardReport({ title, subtitle, chartIds, data, stackedChartId }: ReportOptions) {
        const chartImages: any = {};

        // 1. Capture Standard Charts
        for (const id of chartIds) {
            const element = document.getElementById(id);
            if (element) {
                try {
                    const canvas = await html2canvas(element, {
                        scale: 2,
                        backgroundColor: '#ffffff'
                    });
                    const imgData = canvas.toDataURL('image/png');

                    // Map IDs to specific keys expected by the PDF Template
                    if (id.includes('annual') || id.includes('monthly-trend')) {
                        chartImages.monthlyTrend = imgData;
                    } else if (id.includes('pie-gastos')) {
                        chartImages.distributionGastos = imgData;
                    } else if (id.includes('pie-ingresos')) {
                        chartImages.distributionIngresos = imgData;
                    }
                } catch (err) {
                    console.error(`Error capturing chart ${id}`, err);
                }
            }
        }

        // 2. Capture Stacked Trend if requested
        if (stackedChartId) {
            const element = document.getElementById(stackedChartId);
            if (element) {
                try {
                    const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff' });
                    chartImages.stackedTrend = canvas.toDataURL('image/png');
                } catch (err) {
                    console.error(`Error capturing stacked chart`, err);
                }
            }
        }

        // 3. Generate PDF Blob
        try {
            // Ensure metadata exists
            data.metadata = {
                title,
                generatedAt: new Date().toLocaleDateString(),
                filters: { periodLabel: subtitle }
            };

            const blob = await buildDashboardPDF(data, chartImages);

            // 4. Download
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `reporte_financiero_${new Date().getTime()}.pdf`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error generating PDF document:', error);
            throw error;
        }
    }
};
