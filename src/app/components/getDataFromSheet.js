'use client';

import React, { useState } from 'react';
import Papa from 'papaparse';
import uploadSheetData from '../components/uploadSheetData';

function GetDataFromSheet(){
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [completedRows, setCompletedRows] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [uploadBegun, setUploadBegun] = useState(false)

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    console.log(file.name)
    setProgress(0);
  };

  const handleFileUpload = () => {
    if (file) {
      
      setUploadBegun(true)
      Papa.parse(file, {
        complete: (result) => {
          setTotalRows(result.data.length)
          uploadSheetData(result.data, updateProgress);
        },
        header: true
      });
    }
  };

  const updateProgress = (completed, total) => {
    setCompletedRows(completed)
    setProgress((completed / total) * 100);
  };

  return (
    <div>
      <div className="flex flex-col items-start gap-8">
        <input type="file" accept=".csv" onChange={handleFileChange} />
        {file && (
          <>
          {file.name}
          <button onClick={handleFileUpload} className="border border-black px-4 hover:bg-gray-300">Upload</button>
          </>
        )}
      </div>

      {uploadBegun == true && (
        <div className="flex flex-col mt-4">
          <strong>Upload Progress</strong>
          <div className="w-full border border-black h-full mt-1">
            <div className="progress-bar bg-blue-100 h-4" style={{ width: `${progress}%`}}></div>
          </div>
          {progress > 0 &&
            <span>Uploading! - {completedRows} / {totalRows}</span>
          }
          {progress == 100 &&
            <span>Complete!</span>
          }          
        </div>
      )}

    </div>
  );
};

export default GetDataFromSheet;
