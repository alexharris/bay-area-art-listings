export function GET(request) {
  return new Response(`Hello from ${process.env.VERCEL_REGION}`);
}

export async function POST(request) {
  const requestBody = await request.json();
  const csvData = requestBody.data;

  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 1; i < csvData.length; i++) {
        const row = csvData[i];
        const event = row[2];
        const startDate = row[4];
        const endDate = row[5];
        
        // Simulate processing of each row
        await new Promise(resolve => setTimeout(resolve, 1000));
        const summary = `${event} (${startDate} - ${endDate})`;
        controller.enqueue(`${JSON.stringify(summary)}\n`);
      }
      controller.close();
    }
  });

  return new Response(stream);
}

