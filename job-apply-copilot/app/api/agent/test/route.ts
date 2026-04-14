export const dynamic = 'force-dynamic';

export async function GET() {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            const send = (msg: string) => {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ message: msg })}\n\n`));
            };

            send('SSE works — step 1');
            await new Promise((r) => setTimeout(r, 500));
            send('SSE works — step 2');
            await new Promise((r) => setTimeout(r, 500));
            send('SSE works — step 3');
            controller.close();
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
        },
    });
}
