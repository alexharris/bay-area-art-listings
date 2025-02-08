'use client'

import { useState } from 'react';

export default function GoogleSheetPage() {
  const [data, setData] = useState(null);

  const handleClick = async () => {
    // console.log('click')
    // const sheetId = '1uQejuXXnuVwrU1vGDwcWoM4HlZh1XHwRCVqLJE4yqOg';
    // const range = 'Sheet1!A1:E';
    // const response = await fetch(`/api/googlesheet?sheetId=${sheetId}&range=${range}`);
    // const fetchedData = await response.json();
    // setData(fetchedData);

    const response = await fetch('/api/googlesheet', {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json',
      },
    });    
    console.log(response)
  };
 

  return (
    <div>
      <button onClick={handleClick}>Fetch Google Sheet Data</button> <br />

    </div>
  );
}