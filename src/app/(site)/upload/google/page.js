'use client'

import { useState } from 'react';

export default function GoogleSheetPage() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState(''); // State to hold the input value

  const handleClick = async () => {
    const sheetName = inputValue; // Use the input value as the message
    const eventSource = new EventSource(`/api/googlesheet?sheet=${encodeURIComponent(sheetName)}`);
    eventSource.onmessage = function(event) {
      console.log('Received event:', event);
      const data = JSON.parse(event.data);
      setMessages(prevMessages => [...prevMessages, data.message]);
      if (data.message === 'Upload finished') {
        eventSource.close(); // Close the EventSource connection
        setMessages(prevMessages => [...prevMessages, 'All done!']);
      }
    };
    eventSource.onerror = function() {
      eventSource.close(); // Ensure the EventSource connection is closed on error
    };
  };

  return (
    <div className="p-4">
      <input 
        type="text" 
        value={inputValue} 
        onChange={(e) => setInputValue(e.target.value)} 
        placeholder="Enter your message" 
      />
      <button onClick={handleClick}>Fetch Google Sheet Data</button> <br />
      {messages.length > 0 && (
        <ul>
          {messages.map((message, index) => (
            <li key={index}>{message}</li>
          ))}
        </ul>
      )}
    </div>
  );
}