export async function GET() {
  console.log('hello world1');
  const response = await fetch(process.env.URL + '/api/email', {
    method: 'POST', 
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const data = await response.json();
  console.log(data);

  return new Response(JSON.stringify({ message: 'Hello World' }), {
    headers: { 'Content-Type': 'application/json' }
  });
}