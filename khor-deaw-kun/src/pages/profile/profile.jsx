import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom'; 
import { apiRequest } from '../../service/api'; 
import { TbEdit, TbMessageCircle, TbSend, TbX, TbArrowLeft, TbArrowUp } from "react-icons/tb";
import PostCard from '../Feed/component/feed/PostCard'; // 📌 เช็ค Path ของคุณให้ถูกต้อง
import './profile.css';

const Profile = () => {
  const navigate = useNavigate(); 
  const [userData, setUserData] = useState(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  
  // State สำหรับระบบ Story
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const [storyProgress, setStoryProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // ดึงข้อมูลโปรไฟล์
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await apiRequest('/profile', 'GET');
        setUserData(data);
      } catch (error) {
        alert(error.message || 'Failed to fetch profile data!');
      }
    };
    loadProfile();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // ถ้าเลื่อนลงมาเกิน 300px ให้โชว์ปุ่ม
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // ระบบนับเวลา Story (วิ่ง 3 วินาทีแล้วปิดเอง)
  useEffect(() => {
    let timer;
    if (isStoryOpen) {
      setStoryProgress(0); 
      timer = setInterval(() => {
        setStoryProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setIsStoryOpen(false); 
            return 100;
          }
          return prev + 1; 
        });
      }, 30); 
    } else {
      setStoryProgress(0); 
    }
    return () => clearInterval(timer);
  }, [isStoryOpen]);

  if (!userData) {
    return (
      <div className="profile-page">
        <div className="doodle-box loading-box">Loading Profile... ⏳</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        
        {/* ================= คอลัมน์ซ้าย: สถิติและติดต่อ ================= */}
        <div className="left-panel">  
          
          {/* 🌟 ปุ่ม Back to Feed */}
          <button className="doodle-box back-btn" onClick={() => navigate('/feed')}>
            <div className="icon-flex">
              <TbArrowLeft size={24} />
              <span>Back to Feed</span>
            </div>
          </button>

          <div className="doodle-box stats-container">
            <div className="stat-item"><span className="stat-number">{userData?.stats?.postCount || 0}</span><span className="stat-label">Posts</span></div>
            <div className="stat-divider"></div>
            <div className="stat-item"><span className="stat-number">{userData?.stats?.followingCount || '2.1K'}</span><span className="stat-label">Following</span></div>
            <div className="stat-divider"></div>
            <div className="stat-item"><span className="stat-number">{userData?.stats?.followerCount || '1.4K'}</span><span className="stat-label">Followers</span></div>
          </div>
          
          <div className="contact-section">
            <button className={`doodle-box contact-main-btn ${isContactOpen ? 'active' : ''}`} onClick={() => setIsContactOpen(!isContactOpen)}>
              <div className="icon-flex">{isContactOpen ? <TbX size={24} /> : <TbSend size={24} />} {isContactOpen ? 'Close Contact' : 'Contact Me! ✨'}</div>
            </button>
            <div className={`contact-links-wrapper ${isContactOpen ? 'open' : ''}`}>
              <a href="#" className="doodle-box contact-link line-link"><TbMessageCircle size={24} /> <span>Line Official</span></a>
              <a href="#" className="doodle-box contact-link fb-link"><TbSend size={24} /> <span>Facebook</span></a>
            </div>
          </div>
        </div>

        {/* ================= คอลัมน์กลาง: Header Profile และ Feed ================= */}
        <div className="center-panel">
          <div className="doodle-box profile-header-card">
            <div className="profile-cover"></div>
            <div className="profile-header-content">
              <div className="avatar-wrapper">
                <img src="https://api.dicebear.com/7.x/open-peeps/svg?seed=Duckky" alt="avatar" className="avatar" />
                <div className="online-dot"></div>
              </div>
              <div className="profile-text-info">
                <h1 className="profile-name">{userData.username} <TbEdit className="action-icon edit-icon" size={24} title="Edit Profile" /></h1>
                <p className="profile-bio">{userData?.bio || "HELLO ✨ ยินดีที่ได้รู้จัก! รักการวาดรูปและเขียนโค้ด"}</p>
              </div>
            </div>
          </div>

          <div className="feed-section">
            <PostCard 
               author={userData.username} 
               time="1 min ago" 
               text="หยุดน่ารักได้มั้ย ใจเราก็แค่นี้อะ 🥺 #รักน้องแมวมาก" 
               hasImage={true} 
               imageUrl="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
               likes={105} 
               comments={20} 
            />
            <PostCard 
               author={userData.username} 
               time="2 hours ago" 
               text="วันนี้เขียน React สนุกมาก! ระบบเริ่มเป็นรูปเป็นร่างแล้ว ✨ เปลี่ยน Layout ใหม่ไฉไลกว่าเดิม!" 
               hasImage={false} 
               imageUrl="" 
               likes={42} 
               comments={5} 
            />
          </div>
        </div>

        {/* ================= คอลัมน์ขวา: โพลารอยด์ (Story) และ ความสนใจ ================= */}
        <div className="right-panel">
          
          <div className="doodle-box polaroid-wrapper story-trigger" onClick={() => setIsStoryOpen(true)}>
            <div className="tape"></div>
            <img src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="My Cat" className="polaroid-img" />
            <div className="polaroid-caption">My lovely cat 🐱</div>
          </div>

          <div className="doodle-box interests-box">
            <h3 className="box-title">✨ Interests</h3>
            <div className="tags-container">
              <span className="doodle-tag">💻 Coding</span>
              <span className="doodle-tag">🎮 Game Dev</span>
              <span className="doodle-tag">🤖 Godot</span>
              <span className="doodle-tag">⚛️ React</span>
            </div>
          </div>
        </div>

      </div>

      {/* ================= ส่วนแสดงผล IG Story (Modal) ================= */}
      {isStoryOpen && createPortal(
        <div className="ig-story-overlay" onClick={() => setIsStoryOpen(false)}>
          <div className="ig-story-container" onClick={(e) => e.stopPropagation()}>
            <div className="story-progress-container">
              <div className="story-progress-bar" style={{ width: `${storyProgress}%` }}></div>
            </div>
            <div className="story-header">
              <div className="story-user-info">
                <img src="https://api.dicebear.com/7.x/open-peeps/svg?seed=Duckky" alt="avatar" className="story-avatar-small" />
                <span className="story-username">{userData.username}</span>
                <span className="story-time">2h</span>
              </div>
              <TbX size={26} color="#fff" style={{ cursor: 'pointer' }} onClick={() => setIsStoryOpen(false)} />
            </div>
            <img src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Story" className="story-full-img" />
            <div className="story-text-overlay">
              <div className="doodle-box" style={{ padding: '10px 20px', display: 'inline-block' }}>
                วันนี้แมวน่ารักเป็นพิเศษ 🐱💕
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showScrollTop && (
        <button className="doodle-box scroll-top-btn" onClick={scrollToTop}>
          <TbArrowUp size={28} strokeWidth={3} />
        </button>
      )}

    </div>
  );
};

export default Profile;