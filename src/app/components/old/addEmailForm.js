'use client'

import React, { useState } from 'react';

const AddEmailForm = () => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailJson = {
      email: email // Changed 'address' to 'email' to match the backend
    };
    if (email) {
      try {
        const response = await fetch('/api/addEmail', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailJson),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }


        setSuccess(true);
        setEmail('');
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  return (
    <div className="mt-8">
      <form onSubmit={handleSubmit} className="flex flex-col items-start space-y-2">
        {/* <div className="text-sm uppercase">Weekly Update</div>         */}
        <label className="w-full" htmlFor="email">Get a list of new openings every week</label>
        <input
          className="p-2 border"
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button className="" type="submit">Submit</button>
      </form>
      {success && <p>Thank you! Your email has been submitted.</p>}
    </div>
  );
};

export default AddEmailForm;