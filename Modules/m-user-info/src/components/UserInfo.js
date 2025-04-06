import React from 'react';
import { useSelector } from 'react-redux';

const UserInfo = () => {
  // Get user data from Redux state
  const { username, age } = useSelector(state => state);

  // Format the date if needed
  const formattedAge = age ? new Date(age).toLocaleDateString() : 'N/A';

  return (
    <div className="user-info">
      <h2>User Information</h2>
      <p><strong>Username:</strong> {username}</p>
      <p><strong>Age (Date):</strong> {formattedAge}</p>
    </div>
  );
};

export default UserInfo;