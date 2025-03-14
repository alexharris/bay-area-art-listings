export const config = { runtime: 'edge' };

export async function POST(request) {
  

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }


  const { to, subject, text } = await request.json();

  

  const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: to }],
        },
      ],
      from: {
        email: 'sender@yourdomain.com',
        name: 'Your Name',
      },
      subject: subject,
      content: [
        {
          type: 'text/plain',
          value: text,
        },
      ],
    }),
  });

  if (response.ok) {
    return new Response('Email sent successfully', { status: 200 });
  } else {
    return new Response('Failed to send email', { status: 500 });
  }
}
