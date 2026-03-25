import './LeftPanel.css'
import { TbArrowLeft, TbX, TbSend, TbMessageCircle, TbBrandFacebook, TbBrandInstagram } from "react-icons/tb";
import { useState } from 'react';
import MyVibe from './MyVibe';

// เปลี่ยนมาใช้ LeftPanel เลย (ลบ YourComponent ทิ้งไป)
const LeftPanel = ({ navigate, userData, isContactOpen, setIsContactOpen }) => {
  
  // 1. นำ State และฟังก์ชันมาไว้ข้างใน LeftPanel โดยตรง
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [socials, setSocials] = useState({ 
    line: '', 
    facebook: '', 
    instagram: '' 
  });

  // 2. ฟังก์ชันสำหรับเปิดลิงก์ไปแอปต่างๆ
  const openLink = (platform) => {
    let id = socials[platform]; // เปลี่ยนจาก const เป็น let เพื่อให้แก้ไขค่าได้
    
    if (!id) {
      alert('Input your Contact !');
      return;
    }

    // ✨ --- โค้ดส่วนที่เพิ่มเข้ามาเพื่อจัดการข้อความ --- ✨
    // 1. ตัดช่องว่างที่เผลอพิมพ์ติดมาด้านหน้าและด้านหลังทิ้งไปก่อน
    id = id.trim(); 

    // 2. ถ้าเป็น Facebook หรือ IG แล้วมีการพิมพ์ "เว้นวรรค" ตรงกลาง ให้เปลี่ยนเป็น "จุด (.)" อัตโนมัติ
    if (platform === 'facebook' || platform === 'instagram') {
      id = id.replace(/\s+/g, '.'); 
    }
    // ✨ ------------------------------------------- ✨
    
    // สร้าง URL อัตโนมัติจาก ID ที่ผ่านการทำความสะอาดแล้ว
    let url = '';
    if (platform === 'line') url = `https://line.me/ti/p/~${id}`;
    else if (platform === 'facebook') url = `https://www.facebook.com/${id}`;
    else if (platform === 'instagram') url = `https://www.instagram.com/${id}`;
    
    window.open(url, '_blank'); // เปิดแท็บใหม่
  };

  return (
    <div className="left-panel">
      <button className="doodle-box back-btn" onClick={() => navigate('/feed')}>
        <div className="icon-flex">
          <TbArrowLeft size={24} />
          <span>Back to Feed</span>
        </div>
      </button>

      <div className="doodle-box stats-container">
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

      <MyVibe />

      <div className="contact-section">
        <button 
          className={`doodle-box contact-main-btn ${isContactOpen ? 'active' : ''}`} 
          onClick={() => setIsContactOpen(!isContactOpen)}
        >
          <div className="icon-flex">
            {isContactOpen ? <TbX size={24} /> : <TbSend size={24} />} 
            {isContactOpen ? 'Close Contact' : 'Contact Me ! '}
          </div>
        </button>
        
        <div className={`contact-links-wrapper ${isContactOpen ? 'open' : ''}`}>

          {isEditingContact ? (
            /* ================= โหมดแก้ไข (เป็นช่องกรอกข้อมูล) ================= */
            <>
              {/* 👉 เติมคลาส line-input */}
              <div className="contact-input-box line-input">
                <TbMessageCircle size={28} />
                <input 
                  placeholder="Line ID ..." 
                  value={socials.line} 
                  onChange={(e) => setSocials({...socials, line: e.target.value})} 
                />
              </div>

              {/* 👉 เติมคลาส fb-input */}
              <div className="contact-input-box fb-input">
                <TbBrandFacebook size={28} />
                <input 
                  placeholder="Facebook ID ..." 
                  value={socials.facebook} 
                  onChange={(e) => setSocials({...socials, facebook: e.target.value})} 
                />
              </div>

              {/* 👉 เติมคลาส ig-input */}
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
            /* ================= โหมดปกติ (เป็นปุ่มกดเปิดลิงก์) ================= */
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

          <button className="edit-contact-btn" onClick={() => setIsEditingContact(!isEditingContact)}>
            {isEditingContact ? '💾 Save' : '✏️ Edit the contact '}
          </button>

        </div>
      </div>
    </div>
  );
};

export default LeftPanel;