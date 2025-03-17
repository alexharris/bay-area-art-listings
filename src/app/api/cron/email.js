export async function sendEmail() {
  try {
    const response = await fetch('/api/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({}) // Empty body since our function doesn't require any data
    });

    const result = await response.json();
    console.log('Email sent:', result);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}