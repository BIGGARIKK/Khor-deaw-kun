import './LeftPanel.css'
import { TbArrowLeft, TbX, TbSend, TbMessageCircle, TbBrandFacebook, TbBrandInstagram } from "react-icons/tb";
import { useState } from 'react';

const LeftPanel = ({ navigate, userData, isContactOpen, setIsContactOpen }) => {
  
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [socials, setSocials] = useState({ 
    line: '', 
    facebook: '', 
    instagram: '' 
  });

  const openLink = (platform) => {
    let id = socials[platform]; 
    
    if (!id) {
      alert('Input your Contact !');
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

  return (
    <div className="left-panel">
      {/* 🌟 เปลี่ยนจาก doodle-box เป็น wooden-box เพื่อดึงลายไม้มาใช้ */}
      <button className="wooden-box back-btn" onClick={() => navigate('/beach')}>
        <div className="icon-flex">
          <TbArrowLeft size={24} />
          <span>Back to Feed</span>
        </div>
      </button>

      {/* 🌟 เปลี่ยนจาก doodle-box เป็น wooden-box */}
      <div className="wooden-box stats-container">
        <div className="stat-item">
          <span className="stat-number">{userData?.stats?.postCount || 0}</span>
          <span className="stat-label">Posts</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <span className="stat-number">{userData?.stats?.followingCount || '2.1K'}</span>
          <span className="stat-label">Following</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <span className="stat-number">{userData?.stats?.followerCount || '1.4K'}</span>
          <span className="stat-label">Followers</span>
        </div>
      </div>

      <div className="contact-section">
        {/* 🌟 เปลี่ยนจาก doodle-box เป็น wooden-box */}
        <button 
          className={`wooden-box contact-main-btn ${isContactOpen ? 'active' : ''}`} 
          onClick={() => setIsContactOpen(!isContactOpen)}
        >
          <div className="icon-flex">
            {isContactOpen ? <TbX size={24} /> : <TbSend size={24} />} 
            {isContactOpen ? 'Close Contact' : 'Contact Me ! '}
          </div>
        </button>
        
        <div className={`contact-links-wrapper ${isContactOpen ? 'open' : ''}`}>

          {isEditingContact ? (
            <>
              <div className="contact-input-box line-input">
                <TbMessageCircle size={28} />
                <input 
                  placeholder="Line ID ..." 
                  value={socials.line} 
                  onChange={(e) => setSocials({...socials, line: e.target.value})} 
                />
              </div>

              <div className="contact-input-box fb-input">
                <TbBrandFacebook size={28} />
                <input 
                  placeholder="Facebook ID ..." 
                  value={socials.facebook} 
                  onChange={(e) => setSocials({...socials, facebook: e.target.value})} 
                />
              </div>

              <div className="contact-input-box ig-input">
                <TbBrandInstagram size={28} />
                <input 
                  placeholder="Instagram ID ..." 
                  value={socials.instagram} 
                  onChange={(e) => setSocials({...socials, instagram: e.target.value})} 
                />
              </div>
            </>
          ) : (
            <>
              <button className="contact-link line-link" onClick={() => openLink('line')}>
                <div className="icon-flex">
                  <TbMessageCircle size={28} /> <span>Line</span>
                </div>
              </button>
              <button className="contact-link fb-link" onClick={() => openLink('facebook')}>
                <div className="icon-flex">
                  <TbBrandFacebook size={28} /> <span>Facebook</span>
                </div>
              </button>
              <button className="contact-link ig-link" onClick={() => openLink('instagram')}>
                <div className="icon-flex">
                  <TbBrandInstagram size={28} /> <span>Instagram</span>
                </div>
              </button>
            </>
          )}

          {/* 🌟 เพิ่มคลาส saving-mode เข้าไปตอนที่กำลัง Edit อยู่ */}
          <button 
            className={`edit-contact-btn ${isEditingContact ? 'saving-mode' : ''}`} 
            onClick={() => setIsEditingContact(!isEditingContact)}
          >
            {isEditingContact ? '💾 Save Contact' : '✏️ Edit Contact'}
          </button>

        </div>
      </div>
    </div>
  );
};

export default LeftPanel;