import './AvatarModal.css';
import { createPortal } from 'react-dom';
import { useState } from 'react';

const AvatarModal = ({ setIsAvatarModalOpen, avatarPresets, avatarImage, setAvatarImage }) => {
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
    "@*&#!%~"];

  return createPortal(
    // ส่วนนี้คือพื้นหลังที่กดแล้วจะปิดหน้าต่าง (มีอยู่เดิมแล้ว)
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
                    setAvatarImage(img); 
                    setIsAvatarModalOpen(false); 
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

        {/* 👉 ลบโค้ดส่วน <button className="avatar-close-btn"> ... </button> ออกไปแล้วครับ */}

      </div>
    </div>,
    document.body
  );
};

export default AvatarModal;