'use client';

import { useState } from 'react';

export default function CsvExportButton({ data }) {
  const [copying, setCopying] = useState(false);

  const handleExportCsv = () => {
    if (!data || data.length === 0) return;

    // Create headers
    const headers = ['Location Name', 'Website'];
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...data.map(item => {
        return [
          // Wrap values in quotes and escape quotes inside values
          `"${item.Name?.replace(/"/g, '""') || ''}"`,
          `"${item.Url?.replace(/"/g, '""') || ''}"`,
        ].join(',');
      })
    ].join('\n');

    // Copy to clipboard
    navigator.clipboard.writeText(csvContent).then(() => {
      setCopying(true);
      setTimeout(() => setCopying(false), 2000);
    });
  };

  return (
    <button 
      onClick={handleExportCsv}
      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
    >
      {copying ? 'Copied!' : 'Copy as CSV'}
    </button>
  );
}
