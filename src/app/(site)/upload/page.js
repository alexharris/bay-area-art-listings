import React from 'react';
import GetDataFromSheet from '../../components/getDataFromSheet';
import DeleteAllListings from '../../components/deleteAllListings';



const UploadPage = () => {
    return (
        <div className="p-4">
            <h1 className="text-2xl mb-4">Upload</h1>
            <GetDataFromSheet />
            <DeleteAllListings />
        </div>
    );
};

export default UploadPage;