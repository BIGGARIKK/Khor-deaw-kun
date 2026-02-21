import React from 'react';
import './Profile.css'; // 🌟 Import ไฟล์ CSS เข้ามา

function Profile() {
  return (
    <div className="profile-card">
        
      {/* 🌟 รูปโปรไฟล์ (สไตล์อยู่ใน CSS แล้ว) */}
      <div className="profile-avatar"></div>

      {/* 🌟 ชื่อและสถานะ */}
      <div className="profile-info">
        <strong className="profile-name">
          Doodle_King
        </strong>
        <span className="profile-badge">
          PRO SKETCHER
        </span>
      </div>
      
    </div>
  );
}

export default Profile;