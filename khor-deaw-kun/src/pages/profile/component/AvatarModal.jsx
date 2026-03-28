import './AvatarModal.css';
import { createPortal } from 'react-dom';
import { useState } from 'react';

// 🌟 1. รับ handleUpdateAvatar เข้ามาใน Props ด้วย (เราไม่ต้องใช้ setAvatarImage ตรงนี้แล้ว)
const AvatarModal = ({ setIsAvatarModalOpen, avatarPresets, avatarImage, handleUpdateAvatar }) => {
  const [hoveredAvatar, setHoveredAvatar] = useState(null);

  const hoverPhrases = [
    "Hello, Welcome.", 
    "choose Me Plss ~", 
    "I'm broccoli.", 
    "GREK..GREK..", 
    "GRRRRR !", 
    "Beep...", 
    "I’m happy to meet you.", 
    "Hi! nice to meet.", 
    "@*&#!%~"
  ];

  return createPortal(
    <div className="ig-story-overlay" onClick={() => setIsAvatarModalOpen(false)} style={{ zIndex: 10000 }}>
      
      <div className="avatar-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="avatar-title-wrapper">
          <h2 className="avatar-modal-title">🖼️ Choose your avatar</h2>
        </div>
        
        <div className="avatar-grid">
          {avatarPresets.map((img, idx) => {
            const isSelected = avatarImage === img;
            const isHovered = hoveredAvatar === img;

            return (
              <div 
                key={idx} 
                className="avatar-item-wrapper"
                onMouseEnter={() => setHoveredAvatar(img)} 
                onMouseLeave={() => setHoveredAvatar(null)} 
              >
                <img
                  src={img}
                  onClick={() => { 
                    // 🌟 2. เรียกใช้ฟังก์ชัน handleUpdateAvatar เพื่อเซฟรูปลง Database พร้อมเปลี่ยนรูปบนจอทันที
                    if (handleUpdateAvatar) {
                      handleUpdateAvatar(img);
                    }
                  }}
                  className={`avatar-option ${isSelected ? 'selected' : ''}`}
                  alt={`Avatar ${idx + 1}`}
                />
                
                {isHovered && !isSelected && (
                  <div className="avatar-speech-bubble">
                    {hoverPhrases[idx % hoverPhrases.length]}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>,
    document.body
  );
};

export default AvatarModal;