'use client'

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';


export default function Process() {

  const [text, setText] = useState('');
  const [csvData, setCsvData] = useState('');
  const [notIncluded, setNotIncluded] = useState('');

  // this takes an entry, which is an object that has
  // - info: event title, location, and highlgiht
  // - date: last line, dates
  // - notes: anything else
  function processEntry(entry) {
    // current row:
    // Id	Highlight	Event	Location	StartDate	EndDate	Notes
    console.log(entry.status)
    if(entry.status === 'ok') {
      const csvRow = `${uuidv4()}\t${entry.highlight === 'yes' ? '★' : ''}\t${entry.title || ''}\t${entry.location || ''}\t${entry.startDate || ''}\t${entry.endDate || ''}\t${entry.notes || ''}\n`;
      setCsvData(prevCsvData => prevCsvData + csvRow);
    } else {
      console.log('Not included: ' + entry.title)
      setNotIncluded(prevNotIncluded => prevNotIncluded + entry.title + ' (' + entry.status + ')' + '\n');
    }
  }

  // The goal here is to turn a single date string into two parts, start and end
  function bigBeefyDateProcessor(dateString) {
    console.log('------------------')
    const monthPattern = /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\b/;
    const yearPattern = /\b\d{4}\b/;
    let status = '';

    var dateParts = [];
    // first, check if it has times, which means it is a one day event    
    if (dateString.toLowerCase().includes('a.m.') || dateString.toLowerCase().includes('p.m.')) {
      // Single Day
      // console.log(dateString)
      dateParts = dateString.includes('–') ? dateString.split('–') : dateString.split('&');
      dateParts[1] = dateParts[0]

      // // Strip out 'a.m.' or 'p.m.' from the strings
      dateParts = dateParts.map(part => part.replace(/a\.m\.|p\.m\./gi, '').trim());

      status = 'single day event'
      
    } else if (dateString.includes('–') || dateString.includes('&')) {
      // Multi Day
      dateParts = dateString.includes('–') ? dateString.split('–') : dateString.split('&');
      
      // If one part contains a month and the other does not, we need to add the month to the part that doesn't have it
      
      if (!monthPattern.test(dateParts[0].trim()) && monthPattern.test(dateParts[1].trim())) {
        const month = dateParts[1].trim().match(monthPattern)[0];
        dateParts[0] = `${month} ${dateParts[0].trim()}`;
      } else if (!monthPattern.test(dateParts[1].trim()) && monthPattern.test(dateParts[0].trim())) {
        const month = dateParts[0].trim().match(monthPattern)[0];
        dateParts[1] = `${month} ${dateParts[1].trim()}`;
      }

      // If one part contains a year and the other does not, we need to add the year to the part that doesn't have it
      if (!yearPattern.test(dateParts[0].trim()) && yearPattern.test(dateParts[1].trim())) {
        // console.log('1')
        const year = dateParts[1].trim().match(yearPattern)[0];
        dateParts[0] = `${dateParts[0].trim()} ${year}`;
      } else if (!yearPattern.test(dateParts[1].trim()) && yearPattern.test(dateParts[0].trim())) {
        // console.log('2')
        const year = dateParts[0].trim().match(yearPattern)[0];
        dateParts[1] = `${dateParts[1].trim()} ${year}`;
      } else if (!yearPattern.test(dateParts[0].trim()) && !yearPattern.test(dateParts[1].trim())) {
        // console.log('3')
        const currentYear = new Date().getFullYear();
        dateParts[0] = `${dateParts[0].trim()} ${currentYear}`;
        dateParts[1] = `${dateParts[1].trim()} ${currentYear}`;
      }

      
      // console.log(dateParts[0].trim())
      // console.log(dateParts[1].trim())      
      
      status = 'ok'
      
      

    } else {
      // Not sure what this is
      console.log('Cant parse:' + dateString);
      dateParts[0] = dateString;
      dateParts[1] = dateString;
      status = 'something wrong with this date'
    }
    
    const result = {
      dateParts: dateParts,
      status: status
    };
    return result;
  }

  // this goes through the initial text dump and breaks it up into entries by looking for new lines that are blank
  // it then takes an entry and passes it to processEntry for processing
  const processTextToCSV = () => {

    let entry = {};
  
    const rows = text.split('\n');

    // Add header row
    const headerRow = 'Id\tHighlight\tEvent\tLocation\tStartDate\tEndDate\tNotes\n';
    setCsvData(headerRow);
    setNotIncluded('');
    
    rows.forEach(row => {
      if(row.trim() === '') {
        // this means we have reached the end of a chunk, so we are ready to process the row
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
          var results = bigBeefyDateProcessor(row);
          
          
          // Split the date into two parts
          // const dateParts = row.includes('–') ? row.split('–') : row.split('&');
          
          // // Check if the first part contains a date
          // // Pattern to match the start date
          // const startDatePattern = /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\b \d{1,2}/;
          // // Check the first part against teh pattern
          // entry['startDate'] = startDatePattern.test(dateParts[0].trim()) ? dateParts[0].trim().match(startDatePattern)[0] : '';
          // const endDate = dateParts[1] ? dateParts[1].trim() : '';
          // const endDatePattern = /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\b \d{1,2}/;
          // entry['endDate'] = endDatePattern.test(endDate) ? endDate : '';


          entry['startDate'] = results.dateParts[0].trim();
          entry['endDate'] = results.dateParts[1].trim();
          entry['status'] = results.status;


        } else {
          entry['notes'] = row;
        }
      }        

    })
    
  };

  // const downloadCSV = () => {
  //   const blob = new Blob([csvData], { type: 'text/csv' });
  //   const url = URL.createObjectURL(blob);
  //   const a = document.createElement('a');
  //   a.href = url;
  //   a.download = 'data.csv';
  //   a.click();
  //   URL.revokeObjectURL(url);
  // };

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
            {/* <button
              className="mt-4 p-2 bg-green-500 text-white"
              onClick={downloadCSV}
            >
              Download CSV
            </button> */}
            <button
              className="mt-4 p-2 bg-yellow-500 text-white"
              onClick={() => navigator.clipboard.writeText(csvData)}
            >
              Copy to Clipboard
            </button>
          </div>
        )}
        {notIncluded && (
          <div className="mt-4">
            <h2 className="text-xl mb-2">Not Included</h2>
            <pre className="p-2 bg-gray-100 border max-h-96 overflow-scroll">{notIncluded}</pre>
          </div>
        )}
    </div>
  );
};