import React, { useState } from 'react';
import './profile.css';

const Profile = () => {
    const [isContactOpen, setIsContactOpen] = useState(false);
  return (
    <div className="profile-page">
      <div className="profile-container">
        
        {/* คอลัมน์ซ้าย: สถิติและปุ่ม */}
        <div className="left-panel">
          <div className="doodle-box stat-btn">20 Posts</div>
          <div className="doodle-box stat-btn">2.1K Following</div>
          <div className="doodle-box stat-btn">1.4K Follower</div>
         <div 
        className="doodle-box action-btn"
        onClick={() => setIsContactOpen(!isContactOpen)}
      >
        Contact {isContactOpen ? '▲' : '▼'}
      </div>

      <div className={`contact-dropdown ${isContactOpen ? 'open' : ''}`}>
        <div className="doodle-box contact-item">📱 Line</div>
        <div className="doodle-box contact-item">📘 Facebook</div>
        <div className="doodle-box contact-item">📧 Email</div>
      </div>
          
        </div>

        {/* คอลัมน์กลาง: ข้อมูลหลัก */}
        <div className="center-panel">
          <div className="doodle-box profile-title">PROFILE</div>
          
          <div className="info-section">
            <div className="avatar-wrapper">
              {/* ใช้รูป Default ไปก่อน เปลี่ยน src ได้ตามต้องการ */}
              <img src="https://api.dicebear.com/7.x/open-peeps/svg?seed=Duckky" alt="avatar" className="avatar" />
              <div className="online-dot"></div>
            </div>
            
            <div className="text-info">
              <div className="doodle-box name-box">Duckky</div>
              <div className="doodle-box bio-box">HELLO</div>
            </div>
          </div>

          {/* คอนเทนเนอร์รวมโพสต์ */}
          <div className="doodle-box feed-section">
            <PostItem />
            <PostItem />
          </div>
        </div>

        {/* คอลัมน์ขวา: รูปภาพน้องแมวซ้อนกัน */}
        <div className="right-panel">
          <div className="card-stack">
            {/* การ์ดแผ่นหลังสุด */}
            <div className="photo-card card-bg-2"></div>
            {/* การ์ดแผ่นกลาง */}
            <div className="photo-card card-bg-1"></div>
            {/* การ์ดแผ่นหน้าสุด (รูปแมว) */}
            <div className="photo-card card-front">
              <img src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Cute Cat" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// Component ย่อยสำหรับแต่ละโพสต์ (เขียนไว้ในไฟล์เดียวกันเพื่อความง่าย)
const PostItem = () => {
  return (
    <div className="doodle-box post-item">
      <div className="post-header">
        <div className="post-user">
          <img src="https://api.dicebear.com/7.x/open-peeps/svg?seed=Duckky" alt="user" className="post-avatar" />
          <div>
            <strong>Duckky</strong><br/>
            <span style={{ fontSize: '0.7rem', color: '#666' }}>1 min ago</span>
          </div>
        </div>
        <div className="post-actions">
          <span>105 ❤️</span>
          <span>20 💬</span>
        </div>
      </div>
      <div className="post-content">
        <p>หยุด น่ารักได้มั้ย ใจเราก็แค่นี้อะ</p>
        <p style={{ color: '#FF8A65' }}>#รักน้องแมวมาก</p>
        <div className="post-image"></div>
      </div>
    </div>
  );
};

export default Profile;