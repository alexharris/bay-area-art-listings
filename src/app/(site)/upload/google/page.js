'use client'

import { useState } from 'react';

export default function GoogleSheetPage() {
  const [messages, setMessages] = useState([]);


  // What I think is happening here:
  // 1. The user clicks the button
  // 2. The handleClick function is called
  // 3. An EventSource is created to listen for messages from the server
  // 4. The server is called with a fetch request
  // 5. The server sends messages back to the client
  // 6. The client listens for messages and adds them to the messages state
  // 7. When the server is finished, it sends a 'finished' message
  // 8. The client closes the EventSource

  const handleClick = async () => {
    // Create an EventSource
    const eventSource = new EventSource('/api/googlesheet');
    // Listen for messages
    eventSource.onmessage = function(event) {
      const data = JSON.parse(event.data);
      setMessages(prevMessages => [...prevMessages, data.message]);
      if (data.message === 'Upload finished') {
        eventSource.close();
      }
    };
    // Call the API
    const response = await fetch('/api/googlesheet', {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json',
      },
    });    
  };
 

  return (
    <div>
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