/* eslint-disable @typescript-eslint/no-explicit-any */

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
    // Use pdfjs-dist legacy build directly (works in Node.js without web worker)
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs') as any;

    // Disable worker to run in Node.js server context
    pdfjsLib.GlobalWorkerOptions.workerSrc = '';

    const uint8Array = new Uint8Array(buffer);
    const doc = await pdfjsLib.getDocument({ data: uint8Array, useWorkerFetch: false, isEvalSupported: false, useSystemFonts: true }).promise;

    const textParts: string[] = [];
    for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
            .filter((item: any) => 'str' in item)
            .map((item: any) => item.str)
            .join(' ');
        textParts.push(pageText);
    }

    await doc.destroy();
    return textParts.join('\n');
}

export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
}

export async function extractText(
    buffer: Buffer,
    fileType: string
): Promise<string> {
    if (fileType === 'pdf' || fileType === 'application/pdf') {
        return extractTextFromPdf(buffer);
    }
    if (
        fileType === 'docx' ||
        fileType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
        return extractTextFromDocx(buffer);
    }
    throw new Error(`Unsupported file type: ${fileType}`);
}
