'use client';

import React from 'react';
import GetDataFromSheet from '../../components/getDataFromSheet';
import DeleteAllListings from '../../components/deleteAllListings';
import { useSearchParams } from 'next/navigation'


function UploadPage() {
    
    const searchParams = useSearchParams()

    let isAuthorized = false;
    if(searchParams.get('password') === 'takethewaters') {
        isAuthorized = true;
    } else {
        isAuthorized = false;
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl mb-4">Upload</h1>
            {!isAuthorized ? (
                <div>
                    <form method="get">
                        <input 
                            type="password" 
                            name="password" 
                            placeholder="Enter password" 
                            className="mb-4 p-2 border"
                        />
                        <button type="submit" className="p-2 bg-black text-white">Submit</button>
                    </form>
                </div>
            ) : (
                <>
                    <GetDataFromSheet />
                    <DeleteAllListings />
                </>
            )}
        </div>
    );
};

export default UploadPage;