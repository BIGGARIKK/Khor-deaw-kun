import React from 'react';
import './Profile.css'; // 🌟 Import ไฟล์ CSS เข้ามา
import { useState, useEffect } from 'react';
import { apiRequest } from '../../../../service/api'; // นำเข้า apiRequest จากไฟล์ api.js

function Profile() {

    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const loadProfile = async () => {
          try {
            const data = await apiRequest("/profile", "GET");
            setUserData(data);
           } catch (error) {
            alert(error.message || 'Failed to fetch profile data!');
           }
        };
        loadProfile();
   },[]);
  return (
    <div className="profile-card">
        
      {/* 🌟 รูปโปรไฟล์ (สไตล์อยู่ใน CSS แล้ว) */}
      <div className="profile-avatar"></div>

      {/* 🌟 ชื่อและสถานะ */}
      <div className="profile-info">
        <strong className="profile-name">
          {userData ? userData.username : 'Loading...'}
        </strong>
        <span className="profile-badge">
          PRO SKETCHER
        </span>
      </div>
      
    </div>
  );
}

export default Profile;