import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom'; 
import { apiRequest } from '../../service/api'; 
import { TbEdit, TbMessageCircle, TbSend, TbX, TbArrowLeft, TbArrowUp} from "react-icons/tb";
import { FaInstagram } from "react-icons/fa";
import PostCard from '../Feed/component/feed/PostCard'; 
import './profile.css';

import myAv1 from '../../assets/avatars/1.png';
import myAv2 from '../../assets/avatars/2.png';
import myAv3 from '../../assets/avatars/3.png';
import myAv4 from '../../assets/avatars/4.png';
import myAv5 from '../../assets/avatars/5.png';
import myAv6 from '../../assets/avatars/6.png';
import myAv7 from '../../assets/avatars/7.png';
import myAv8 from '../../assets/avatars/8.png';
import myAv9 from '../../assets/avatars/9.png';

const Profile = () => {
  const navigate = useNavigate(); 
  const [userData, setUserData] = useState(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [bannerColor, setBannerColor] = useState('#50ade2'); 
  const colorInputRef = useRef(null);

  // ✅ แก้ไขบรรทัดที่ 26: ลบคอมม่าเกิน และใช้ชื่อตัวแปรที่ import มาจริง
  const avatarPresets = [myAv1, myAv2, myAv3, myAv4, myAv5, myAv6, myAv7, myAv8, myAv9];
  
  // ✅ แก้ไขบรรทัดที่ 27: เปลี่ยนจาก imgAv1 เป็น myAv1 ให้ตรงกับด้านบน
  const [avatarImage, setAvatarImage] = useState(myAv1);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const [storyProgress, setStoryProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

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

      <input 
        type="color" 
        ref={colorInputRef} 
        style={{ display: 'none' }} 
        onChange={(e) => setBannerColor(e.target.value)}
      />
      <div className="profile-container">
        
        <div className="left-panel">  
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
              <div className="icon-flex">{isContactOpen ? <TbX size={24} /> : <TbSend size={24} />} {isContactOpen ? 'Close Contact' : 'Contact Me ! '}</div>
            </button>
            <div className={`contact-links-wrapper ${isContactOpen ? 'open' : ''}`}>
              <a href="https://line.me/ti/p/~YOUR_LINE_ID" target="_blank" rel="noreferrer" className="doodle-box contact-link line-link">
              <TbMessageCircle size={24} /> <span>Line</span>
            </a>
              <a href="https://www.facebook.com/YOUR_USERNAME" target="_blank" rel="noreferrer" className="doodle-box contact-link fb-link">
              <TbSend size={24} /> <span>Facebook</span>
            </a>
              <a href="https://www.instagram.com/YOUR_USERNAME" target="_blank" rel="noreferrer" className="doodle-box contact-link ig-link">
            <FaInstagram size={24} /> <span>Instagram</span>
           </a>
            </div>
          </div>
        </div>

        <div className="center-panel">
          <div className="doodle-box profile-header-card">
            <div 
              className="profile-cover" 
              onClick={() => colorInputRef.current.click()} 
              style={{ 
                cursor: 'pointer', 
                backgroundColor: bannerColor, 
                backgroundImage: 'none',
                position: 'relative' 
              }}
            >
            </div>
            <div className="profile-header-content">
              <div className="avatar-wrapper" onClick={() => setIsAvatarModalOpen(true)} style={{ cursor: 'pointer' }}>
                <img src={avatarImage} alt="avatar" className="avatar" />
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
          </div>
        </div>

        <div className="right-panel">
          <div className="doodle-box polaroid-wrapper story-trigger" onClick={() => setIsStoryOpen(true)}>
            <div className="tape"></div>
            <img src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="My Cat" className="polaroid-img" />
            <div className="polaroid-caption">My lovely cat 🐱</div>
          </div>
        </div>
      </div>

      {/* ✅ เพิ่มส่วน Modal เลือกรูปโปรไฟล์ก่อนหน้า Story Modal */}
      {isAvatarModalOpen && createPortal(
        <div className="ig-story-overlay" onClick={() => setIsAvatarModalOpen(false)} style={{ zIndex: 10000 }}>
          <div className="doodle-box" onClick={(e) => e.stopPropagation()} style={{ background: 'white', padding: '20px', maxWidth: '450px', width: '90%', borderRadius: '25px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '15px' }}>Choose your avatar</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', maxHeight: '350px', overflowY: 'auto' }}>
              {avatarPresets.map((img, idx) => (
                <img 
                  key={idx} 
                  src={img} 
                  onClick={() => { setAvatarImage(img); setIsAvatarModalOpen(false); }}
                  style={{ 
                    width: '100%', 
                    cursor: 'pointer', 
                    borderRadius: '50%', 
                    border: avatarImage === img ? '4px solid #84E045' : '2px solid #eee' 
                  }} 
                />
              ))}
            </div>
            <h4 className="doodle-box" onClick={() => setIsAvatarModalOpen(false)} style={{ width: '100%', marginTop: '15px', padding: '10px', cursor: 'pointer', textAlign: 'center' }}>Close</h4>
          </div>
        </div>,
        document.body
      )}

      {/* ================= ส่วนแสดงผล IG Story (Modal) ================= */}
      {isStoryOpen && createPortal(
        <div className="ig-story-overlay" onClick={() => setIsStoryOpen(false)}>
          <div className="ig-story-container" onClick={(e) => e.stopPropagation()}>
            <div className="story-progress-container">
              <div className="story-progress-bar" style={{ width: `${storyProgress}%` }}></div>
            </div>
            <div className="story-header">
              <div className="story-user-info">
                <img src={avatarImage} alt="avatar" className="story-avatar-small" />
                <span className="story-username">{userData.username}</span>
                <span className="story-time">2h</span>
              </div>
              <TbX size={26} color="#fff" style={{ cursor: 'pointer' }} onClick={() => setIsStoryOpen(false)} />
            </div>
            <img src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Story" className="story-full-img" />
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