'use client';

import { useState } from 'react';

export default function EmailPage() {
  const [loading, setLoading] = useState(false);

  const sendEmail = async () => {
    setLoading(true);
    const response = await fetch('/api/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'hello@alexharris.online',
        subject: 'Test Email',
        text: 'This is a test email.',
      }),
    });
    console.log(response)

    if (response.ok) {
      alert('Email sent successfully');
    } else {
      alert('Failed to send email 1');
    }
    setLoading(false);
  };

  return (
    <div>
      <h1>Send Email</h1>
      <button onClick={sendEmail} disabled={loading}>
        {loading ? 'Sending...' : 'Send Email'}
      </button>
    </div>
  );
}
