import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { TbX } from "react-icons/tb";
import './RightPanel.css';

const RightPanel = ({ userPosts, userData }) => {
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // กรองเอารูปภาพ (สูงสุด 9 รูปเพื่อให้เป็น Grid 3x3 สวยๆ)
  const galleryPhotos = userPosts
    .filter(p => p.image_url && p.image_url.trim() !== "")
    .slice(0, 9);

  return (
    <div className="right-panel-container">
      
      {/* 🖼️ Widget: Photos (ใช้คลาส wooden-box ของคุณ) */}
      <div className="wooden-box profile-widget-box">
        <h3 className="widget-title">📸 Photos</h3>
        <div className="photo-grid-layout">
          {galleryPhotos.length > 0 ? (
            galleryPhotos.map((p, i) => (
              <div 
                key={i} 
                className="photo-grid-item" 
                onClick={() => setSelectedPhoto(p.image_url)}
              >
                <img src={p.image_url} alt="Gallery" />
              </div>
            ))
          ) : (
            <p className="empty-txt">ยังไม่มีรูปถ่าย.. 🌊</p>
          )}
        </div>
      </div>

      {/* 👥 Widget: Following */}
      <div className="wooden-box profile-widget-box">
        <h3 className="widget-title">🤝 Following</h3>
        <div className="following-list-col">
          {userData?.following?.length > 0 ? (
            userData.following.slice(0, 5).map((f, i) => (
              <div key={i} className="following-row">
                <div className="mini-avatar-circle">
                   <img src={`/src/assets/avatars/${(i % 9) + 1}.png`} alt="friend" />
                </div>
                <span className="friend-name">{f}</span>
              </div>
            ))
          ) : (
            <p className="empty-txt">ยังไม่มีเพื่อนร่วมตี้ 🍻</p>
          )}
        </div>
      </div>

      {/* Modal ดูรูปใหญ่ */}
      {selectedPhoto && createPortal(
        <div className="photo-zoom-overlay" onClick={() => setSelectedPhoto(null)}>
          <div className="photo-zoom-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-zoom-btn" onClick={() => setSelectedPhoto(null)}>
              <TbX size={35} />
            </button>
            <img src={selectedPhoto} alt="Zoom" className="img-full" />
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default RightPanel;