import React from 'react';
import GetDataFromSheet from '../components/getDataFromSheet';

const UploadPage = () => {
    return (
        <div className="p-8">
            <h1 className="text-2xl mb-4">Upload</h1>
            <GetDataFromSheet />
        </div>
    );
};

export default UploadPage;