'use client'

import { useState } from 'react';

export default function GoogleSheetPage() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState(''); // State to hold the input value
  const [inputVisible, setInputVisible] = useState(true); // State to control input visibility
  const [showRestartButton, setShowRestartButton] = useState(false);

  const handleClick = async () => {
    if (!inputValue.trim()) {
      setMessages([]);
      setMessages(prevMessages => [...prevMessages, 'Please enter a sheet name.']);
      return;
    }
    setMessages([]);
    const sheetName = inputValue; // Use the input value as the message
    const eventSource = new EventSource(`/api/googlesheet?sheet=${encodeURIComponent(sheetName)}`);
    eventSource.onmessage = function(event) {
      setInputVisible(false); // Hide the input field after button click
      // console.log('Received event:', event.data);
      const data = JSON.parse(event.data);
      if (data.message === 'Upload finished') {
        eventSource.close(); // Close the EventSource connection
        setMessages(prevMessages => [...prevMessages, 'All done!']);
        setInputVisible(true); // Show the input
      } else if (data.message === 'sheet-not-found') {
        console.log('Sheet not found');
        eventSource.close(); // Close the EventSource connection
        setMessages(prevMessages => [...prevMessages, 'Could not find that sheet.']);
        setInputVisible(true); // Show the input
      } else if (data.message === 'no-rows') {
        eventSource.close(); // Close the EventSource connection
        setMessages(prevMessages => [...prevMessages, 'No rows in that sheet.']);
        setInputVisible(true); // Show the input
        setShowRestartButton(true);
      } else {
        setMessages(prevMessages => [...prevMessages, data.message]);
      }   
    };
    eventSource.onerror = function(error) {
      console.log('Received error:', error);
      eventSource.close(); // Ensure the EventSource connection is closed on error
    };
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Upload Listings</h1>
      {inputVisible && (
        <div className='mb-4 p-2 bg-gray-50'>
          <input 
            type="text" 
            value={inputValue} 
            onChange={(e) => setInputValue(e.target.value)} 
            placeholder="Enter a sheet name" 
            className='border p-2 mr-2'
          />
        
          <button 
            onClick={handleClick} 
            className='bg-blue-500 text-white p-2 rounded'
          >
            Fetch Data
          </button>
        </div>
      )}
      {messages.length > 0 && (
        <ul>
          {messages.map((message, index) => (
            <li key={index}>{message}</li>
          ))}
        </ul>
      )}
      {showRestartButton && (
        <a href="/upload/listings" className="p-2 bg-blue-500 text-white my-4">Start Over</a>
      )}
    </div>
  );
}