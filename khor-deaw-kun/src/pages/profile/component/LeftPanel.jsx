import './LeftPanel.css'
import { TbArrowLeft, TbX, TbSend, TbMessageCircle, TbBrandFacebook, TbBrandInstagram } from "react-icons/tb";
import { useState, useEffect } from 'react';
import { apiRequest } from "../../../service/api";
import MyVibe from './MyVibe';

const formatStat = (num) => {
  if (!num || isNaN(num)) return '0';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num;
};

// 🌟 รับค่า isOwnProfile เข้ามา (ค่าเริ่มต้น = true)
const LeftPanel = ({ navigate, userData, setUserData, actualPostCount, isContactOpen, setIsContactOpen, isOwnProfile = true }) => {
  
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [socials, setSocials] = useState({ 
    line: '', 
    facebook: '', 
    instagram: '' 
  });

  useEffect(() => {
    if (userData && userData.socials) {
      setSocials({
        line: userData.socials.line || '',
        facebook: userData.socials.facebook || '',
        instagram: userData.socials.instagram || ''
      });
    }
  }, [userData]);

  const handleToggleEdit = async () => {
    if (isEditingContact) {
      
      // เช็คว่าข้อมูลไม่มีการเปลี่ยนแปลงจากเดิมเลยใช่ไหม
      const isUnchanged = 
        socials.line === (userData?.socials?.line || '') &&
        socials.facebook === (userData?.socials?.facebook || '') &&
        socials.instagram === (userData?.socials?.instagram || '');

      // 🌟 1. ถ้ากดเปิดมาแล้วไม่ได้กรอกอะไรเลย (หรือไม่ได้แก้) ให้ย้อนกลับหน้าเดิม
      if (isUnchanged) {
        setIsEditingContact(false);
        return; 
      }

      // เช็คว่าช่องถูกปล่อยว่างทั้งหมดหรือไม่
      const isAllEmpty = !socials.line.trim() && !socials.facebook.trim() && !socials.instagram.trim();

      try {
        await apiRequest('/profile', 'PUT', { socials: socials });
        if (setUserData) {
          setUserData(prev => ({ ...prev, socials: socials }));
        }
      
        if (!isAllEmpty) {
          alert("successfully! 💾"); 
        }

      } catch (error) {
        alert("Failed!");
        console.error(error);
      }
    }
    
    // เปลี่ยนสถานะเพื่อปิดโหมด Edit
    setIsEditingContact(!isEditingContact);
  };

  const openLink = (platform) => {
    let id = socials[platform]; 
    
    // ถ้ายังไม่มี ID ให้แจ้งเตือนผู้ใช้ (ถ้าเป็นเพื่อนมากด แล้วเราไม่ตั้ง ID ไว้ มันก็จะแจ้งแบบนี้เช่นกัน)
    if (!id || id.trim() === '') {
      alert(`No ${platform.charAt(0).toUpperCase() + platform.slice(1)} ID provided! `);
      return; 
    }
    
    id = id.trim(); 
    if (platform === 'facebook' || platform === 'instagram') {
      id = id.replace(/\s+/g, '.'); 
    }
    let url = '';
    if (platform === 'line') url = `https://line.me/ti/p/~${id}`;
    else if (platform === 'facebook') url = `https://www.facebook.com/${id}`;
    else if (platform === 'instagram') url = `https://www.instagram.com/${id}`;
    
    window.open(url, '_blank'); 
  };

  const postCount = actualPostCount !== undefined ? actualPostCount : (userData?.stats?.postCount || 0);
  const followingCount = userData?.following?.length || 0;
  const followersCount = userData?.followers?.length || 0;

  return (
    <div className="left-panel">
      <button className="wooden-box back-btn" onClick={() => navigate('/beach')}>
        <div className="icon-flex">
          <TbArrowLeft size={24} />
          <span>Back to Feed</span>
        </div>
      </button>

      <div className="wooden-box stats-container">
        <div className="stat-item">
          <span className="stat-number">{formatStat(postCount)}</span>
          <span className="stat-label">Posts</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <span className="stat-number">{formatStat(followingCount)}</span>
          <span className="stat-label">Following</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <span className="stat-number">{formatStat(followersCount)}</span>
          <span className="stat-label">Followers</span>
        </div>
      </div>

      {/* 🌟 ส่ง isOwnProfile ให้ MyVibe ต่อ */}
      <MyVibe userData={userData} setUserData={setUserData} isOwnProfile={isOwnProfile} />

      <div className="contact-section">
        <button 
          className={`wooden-box contact-main-btn ${isContactOpen ? 'active' : ''}`} 
          onClick={() => setIsContactOpen(!isContactOpen)}
        >
          <div className="icon-flex">
            {isContactOpen ? <TbX size={24} /> : <TbSend size={24} />} 
            {isContactOpen ? 'Close Contact' : 'Contact ! '}
          </div>
        </button>
        
        <div className={`contact-links-wrapper ${isContactOpen ? 'open' : ''}`}>
          {isEditingContact ? (
            <>
              <div className=" contact-input-box line-input">
                <TbMessageCircle size={28} />
                <input placeholder="Line ID ..." value={socials.line} onChange={(e) => setSocials({...socials, line: e.target.value})} />
              </div>
              <div className="contact-input-box fb-input">
                <TbBrandFacebook size={28} />
                <input placeholder="Facebook ID ..." value={socials.facebook} onChange={(e) => setSocials({...socials, facebook: e.target.value})} />
              </div>
              <div className="contact-input-box ig-input">
                <TbBrandInstagram size={28} />
                <input placeholder="Instagram ID ..." value={socials.instagram} onChange={(e) => setSocials({...socials, instagram: e.target.value})} />
              </div>
            </>
          ) : (
            <>
              <button className="contact-link line-link" onClick={() => openLink('line')}>
                <div className="icon-flex"><TbMessageCircle size={28} /> <span>Line</span></div>
              </button>
              <button className="contact-link fb-link" onClick={() => openLink('facebook')}>
                <div className="icon-flex"><TbBrandFacebook size={28} /> <span>Facebook</span></div>
              </button>
              <button className="contact-link ig-link" onClick={() => openLink('instagram')}>
                <div className="icon-flex"><TbBrandInstagram size={28} /> <span>Instagram</span></div>
              </button>
            </>
          )}

          {/* 🌟 ปุ่ม Edit จะโชว์ก็ต่อเมื่อเป็นโปรไฟล์เราเท่านั้น */}
          {isOwnProfile && (
            <button 
              className={`edit-contact-btn ${isEditingContact ? 'saving-mode' : ''}`} 
              onClick={handleToggleEdit}
            >
              {isEditingContact ? '💾 Save Contact' : '✏️ Edit Contact'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeftPanel;