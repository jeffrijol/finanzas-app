import html2canvas from 'html2canvas';

/**
 * Options for the capture process
 */
interface CaptureOptions {
    scale?: number;
    backgroundColor?: string;
    quality?: number; // 0 to 1 for JPEG
}

/**
 * Captures a DOM element as a base64 image string.
 * Applies a '.print-mode' class during capture to allow CSS overrides.
 */
export async function captureChart(elementId: string, options: CaptureOptions = {}): Promise<string> {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Chart element with ID '${elementId}' not found.`);
        return '';
    }

    const {
        scale = 2, // Retina quality by default
        backgroundColor = '#ffffff'
    } = options;

    try {
        // 1. Wait for fonts (critical for text rendering)
        await document.fonts.ready;

        // 2. Add print-mode class for CSS simplification
        element.classList.add('print-mode');

        // Optional: Wait a tiny bit for any CSS transitions (unlikely needed if class is instant)
        await new Promise(resolve => setTimeout(resolve, 50));

        // 3. Capture with html2canvas
        const canvas = await html2canvas(element, {
            scale: scale,
            useCORS: true,
            allowTaint: true, // Be careful with this if using external images
            backgroundColor: backgroundColor,
            logging: false, // Turn off for production
            onclone: (clonedDoc) => {
                const clonedElement = clonedDoc.getElementById(elementId);
                if (clonedElement) {
                    // Ensure tooltips are hidden in the clone explicitly if CSS fails
                    // This is a backup to the CSS rule
                    const tooltips = clonedElement.querySelectorAll('.recharts-tooltip-cursor, .recharts-tooltip-wrapper');
                    tooltips.forEach((el: any) => el.style.display = 'none');
                }
            }
        });

        // 4. Cleanup
        element.classList.remove('print-mode');

        // 5. Return Data URL (Default to PNG for losslessness)
        // If size is an issue later, we can switch to 'image/jpeg' and options.quality
        return canvas.toDataURL('image/png');
    } catch (error) {
        console.error(`Failed to capture chart ${elementId}:`, error);
        // Ensure cleanup happens even on error
        element.classList.remove('print-mode');
        return '';
    }
}
