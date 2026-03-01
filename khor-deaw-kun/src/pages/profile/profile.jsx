import React from 'react';
import './profile.css';
import bgImage from '../../assets/bg.png'; // ตรวจสอบว่า Path นี้ถูกต้องตามโครงสร้างโฟลเดอร์

const App = () => {
  const posts = [
    { id: 1, text: "หมูสามชั้นนนนนนนน", tag: "#ร้านอร่อยบอกต่อ", likes: 105, comments: 20 },
    { id: 2, text: "หมูสามชั้นนนนนนนน", tag: "#ร้านอร่อยบอกต่อ", likes: 105, comments: 20 },
  ];

  return (
    /* เพิ่ม div ครอบทั้งหมดเพื่อแสดงพื้นหลัง */
    <div className="main-layout" style={{ 
      backgroundImage: `url(${bgImage})`,
      backgroundRepeat: 'repeat',
      backgroundSize: '500px', // ปรับขนาดลายตามความเหมาะสม
      backgroundAttachment: 'fixed',
      height: '100vh',
      overflow: 'hidden'
    }}>
      <div className="app-container">
        {/* ---------------- ซ้าย: สถิติและลิงก์ ---------------- */}
        <div className="left-panel">
          <div className="stat-box neo-box">
            <span>20</span>
            <span>Posts</span>
          </div>
          <div className="stat-box neo-box">
            <span>2.1K</span>
            <span>Following</span>
          </div>
          <div className="stat-box neo-box">
            <span>1.4K</span>
            <span>Follower</span>
          </div>

          <div className="contact-btn neo-box">Contact</div>

          <div className="link-list">
            <div className="link-box">🌐 Link</div>
            <div className="link-box">◎ Link</div>
            <div className="link-box">☺ Link</div>
          </div>
        </div>

        {/* ---------------- กลาง: โปรไฟล์และฟีด ---------------- */}
        <div className="center-panel">
          <div className="profile-title neo-box">PROFILE</div>

          <div className="profile-header">
            <div className="avatar-wrapper">
              <img 
                src="https://api.dicebear.com/7.x/notionists/svg?seed=Duckky" 
                alt="Avatar" 
                className="avatar-img" 
              />
              <div className="status-dot"></div>
            </div>

            <div className="name-bio-wrapper">
              <div className="name-box neo-box">Duckky</div>
              <div className="diamond-icon"></div>
              <div className="bio-box neo-box">HELLO</div>
            </div>
          </div>

          <div className="feed-container neo-box">
            {posts.map((post) => (
              <div key={post.id} className="post-card neo-box">
                <div className="post-header">
                  <div className="user-info">
                    <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Duckky" alt="user" />
                    <div>
                      <p className="user-name">Duckky</p>
                      <p className="post-time">5 min ago</p>
                    </div>
                  </div>
                  <div className="post-stats">
                    <span>{post.likes} ❤️</span>
                    <span>{post.comments} 💬</span>
                  </div>
                </div>
                <div className="post-content">
                  <div>{post.text}</div>
                  <div className="hashtag">{post.tag}</div>
                </div>
                <div className="post-image-placeholder">
                   bacon 🥓
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ---------------- ขวา: รูปภาพแมวซ้อนกัน ---------------- */}
        <div className="right-panel">
          <div className="photo-stack">
            <img 
              src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80" 
              alt="cat-back" 
              className="stacked-img img-back" 
            />
            <img 
              src="https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=400&q=80" 
              alt="cat-mid" 
              className="stacked-img img-middle" 
            />
            <img 
              src="https://images.unsplash.com/photo-1529778459826-3d2310134700?auto=format&fit=crop&w=400&q=80" 
              alt="cat-front" 
              className="stacked-img img-front" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;