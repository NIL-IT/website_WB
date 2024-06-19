import React from 'react';
//import './ProfilePage.css';

const ProfilePage = () => {
  return (
    <div className="profile-page">
      <h1>Profile</h1>
      <ul>
        <li><a href="/about">About the Service</a></li>
        <li><a href="/guide">Guide</a></li>
        <li><a href="/purchases">My Purchases</a></li>
        <li><a href="/add-product">Add Product</a></li>
        <li><a href="/catalog">Catalog</a></li>
        <li><a href="/support">Support</a></li>
      </ul>
    </div>
  );
};

export default ProfilePage;