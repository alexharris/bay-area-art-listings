import React from 'react';
import DeleteAllListings from '../../components/deleteAllListings';
import CallHelloApiButton from '../../components/CallHelloApiButton';

export default async function Upload({ searchParams }) {
    const enteredPassword = await searchParams;

    let isAuthorized = false;
    let errorMessage = '';
    if (enteredPassword.password === process.env.UPLOAD_PASSWORD) {
        isAuthorized = true;
    } else if (enteredPassword.password) {
        errorMessage = 'Incorrect password';
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
                    {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
                </div>
            ) : (
                <>
                <a 
                    className="p-2 bg-blue-500 text-white mb-4"
                    href="/upload/listings"
                >
                    Upload Listings
                </a>
                
                    <DeleteAllListings />
                    <CallHelloApiButton />
                </>
            )}
        </div>
    );
};