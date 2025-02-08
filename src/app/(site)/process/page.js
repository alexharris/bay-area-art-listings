'use client'

import { useState } from 'react';


export default function Process() {

  const [text, setText] = useState('');
  const [csvData, setCsvData] = useState('');

  // this takes an entry, which is an object that has
  // - info: event title, location, and highlgiht
  // - date: last line, dates
  // - notes: anything else
  function processEntry(entry) {
    // current row:
    // Id	Highlight	Event	Location	StartDate	EndDate	Notes
    const csvRow = `${''}\t${entry.highlight === 'yes' ? '★' : ''}\t${''}\t${entry.title || ''}\t${entry.location || ''}\t${entry.startDate || ''}\t${entry.endDate || ''}\t${entry.notes || ''}\n`;
    setCsvData(prevCsvData => prevCsvData + csvRow);
  }

  // this goes through the initial text dump and breaks it up into entries by looking for new lines that are blank
  // it then takes an entry and passes it to processEntry for processing
  const processTextToCSV = () => {

    let entry = {};
  
    const rows = text.split('\n');

    rows.forEach(row => {

      if(row.trim() === '') {
        processEntry(entry)
        entry = {};
        
      } else {
        const datePattern = /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\b/;

        if (row.includes('@')) {
          if (row.includes('★')) {
            entry['highlight'] = 'yes';
          }
          const atIndex = row.indexOf('@');
          entry['title'] = row.substring(0, atIndex).replace('★', '').trim();
          entry['location'] = row.substring(atIndex + 1).trim();
        } else if (datePattern.test(row)) {
            const dateParts = row.split('–');
            const startDatePattern = /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\b \d{1,2}/;
            entry['startDate'] = startDatePattern.test(dateParts[0].trim()) ? dateParts[0].trim().match(startDatePattern)[0] : '';
            console.log(entry['startDate']);
            const endDate = dateParts[1] ? dateParts[1].trim() : '';
            const endDatePattern = /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\b \d{1,2}/;
            entry['endDate'] = endDatePattern.test(endDate) ? endDate : '';
        } else {
          entry['notes'] = row;
        }
      }        

    })

  };

  const downloadCSV = () => {
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4">
        <h1 className="text-2xl mb-4">Process</h1>
        <textarea
          className="w-full h-64 p-2 border"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste formatted text here"
        />
        <button
          className="mt-4 p-2 bg-blue-500 text-white"
          onClick={processTextToCSV}
        >
          Process to CSV
        </button>
        {csvData && (
          <div className="mt-4">
            <h2 className="text-xl mb-2">CSV Data</h2>
            <pre className="p-2 bg-gray-100 border max-h-96 overflow-scroll">{csvData}</pre>
            <button
              className="mt-4 p-2 bg-green-500 text-white"
              onClick={downloadCSV}
            >
              Download CSV
            </button>
          </div>
        )}
    </div>
  );
};