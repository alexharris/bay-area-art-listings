'use client';

import React, { useState } from 'react';
import Papa from 'papaparse';
import uploadSheetData from '../components/uploadSheetData';

function GetDataFromSheet(){
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileUpload = () => {
    if (file) {
      Papa.parse(file, {
        complete: (result) => {
          uploadSheetData(result.data);
        },
        header: true
      });
    }
  };

  return (
    <div>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button onClick={handleFileUpload} className="border border-black px-2 hover:bg-gray-300">Upload</button>
    </div>
  );
};

export default GetDataFromSheet;
