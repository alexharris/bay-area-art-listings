'use client'

import { useState } from 'react';


export default function SendEmailPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');


  const sendEmail = async () => {
    setIsLoading(true);
    setMessage('');

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
      setMessage('Email sent successfully!');
    } catch (error) {
      console.error('Error sending email:', error);
      setMessage('Failed to send email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  async function testCron(req, res) {
    const response = await fetch('/api/cron/email', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },

    });    
    const result = await response.json();
    console.log('Cron test:', result)
  }

  return (
    <div>
        <h1>Send Email</h1>
        <button onClick={sendEmail} disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Email'}
        </button>
        {message && <p>{message}</p>}
        -----
        <button onClick={testCron}>
          test cron
        </button>
    </div>
  );
}
