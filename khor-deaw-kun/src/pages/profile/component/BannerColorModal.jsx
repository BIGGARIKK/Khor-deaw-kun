import './BannerColorModal.css';
import { createPortal } from 'react-dom';

const BannerColorModal = ({ setIsColorModalOpen, bannerColor, setBannerColor, bannerPresets }) => {
  // ชุดสีพร้อมลวดลาย (Pattern) สไตล์พาสเทลน่ารักๆ
  const colorPresets = [
    { id: 1, color: '#ffb8b8', pattern: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.4) 0px, rgba(255,255,255,0.4) 15px, transparent 15px, transparent 30px)', size: '100% 100%' }, // ลายทางเอียง
    { id: 2, color: '#ff9f43', pattern: 'radial-gradient(rgba(255,255,255,0.6) 15%, transparent 16%), radial-gradient(rgba(255,255,255,0.6) 15%, transparent 16%)', size: '20px 20px', position: '0 0, 10px 10px' }, // ลายจุด Polka dot
    { id: 3, color: '#ffe066', pattern: 'linear-gradient(rgba(255,255,255,0.5) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.5) 2px, transparent 2px)', size: '20px 20px' }, // ลายตารางสมุด
    { id: 4, color: '#84e045', pattern: 'none', size: '100% 100%' }, // สีล้วน
    { id: 5, color: '#50ade2', pattern: 'repeating-linear-gradient(-45deg, rgba(255,255,255,0.3) 0px, rgba(255,255,255,0.3) 15px, transparent 15px, transparent 30px)', size: '100% 100%' }, // ลายทางเอียงซ้าย
    { id: 6, color: '#b088f9', pattern: 'radial-gradient(circle at 0 0, rgba(255,255,255,0.4) 50%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(255,255,255,0.4) 50%, transparent 50%)', size: '30px 30px' }, // ลายเกล็ดปลา
    { id: 7, color: '#ff99c8', pattern: 'repeating-radial-gradient(circle, transparent, transparent 10px, rgba(255,255,255,0.4) 10px, rgba(255,255,255,0.4) 20px)', size: '100% 100%' }, // ลายวงแหวนคลื่น
    { id: 8, color: '#a0c4ff', pattern: 'linear-gradient(45deg, rgba(255,255,255,0.4) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.4) 75%, rgba(255,255,255,0.4)), linear-gradient(45deg, rgba(255,255,255,0.4) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.4) 75%, rgba(255,255,255,0.4))', size: '20px 20px', position: '0 0, 10px 10px' }, // ลายตารางหมากรุก
    { id: 9, color: '#fdffb6', pattern: 'none', size: '100% 100%' }, // สีล้วน
    { id: 10, color: '#caffbf', pattern: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.5) 0, rgba(255,255,255,0.5) 15px, transparent 15px, transparent 30px)', size: '100% 100%' }, // ลายทางตั้ง
    { id: 11, color: '#ffd6a5', pattern: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.4) 0, rgba(255,255,255,0.4) 10px, transparent 10px, transparent 20px)', size: '100% 100%' }, // ลายทางขวาง
    { id: 12, color: '#30795d', pattern: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.1) 0, rgba(255,255,255,0.1) 5px, transparent 5px, transparent 10px)', size: '100% 100%' } // ลายเส้นบางดำ
  ];
  
  return createPortal(
    <div className="ig-story-overlay" onClick={() => setIsColorModalOpen(false)} style={{ zIndex: 10000 }}>
      <div className="avatar-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="avatar-title-wrapper">
          <h2 className="avatar-modal-title">🎨 Choose Banner Color</h2>
        </div>
        
        <div className="color-grid">
          {/* 👉 เปลี่ยนจาก colorPresets.map เป็น bannerPresets.map */}
          {bannerPresets.map((preset) => (
            <div
              key={preset.id}
              className={`color-option ${bannerColor?.id === preset.id ? 'selected' : ''}`}
              style={{ 
                backgroundColor: preset.color,
                backgroundImage: preset.pattern,
                backgroundSize: preset.size,
                backgroundPosition: preset.position || '0 0'
              }}
              onClick={() => { 
                setBannerColor(preset); 
                setIsColorModalOpen(false); 
              }}
            >
              {bannerColor?.id === preset.id && <div className="color-selected-mark"></div>}
            </div>
          ))}
        </div>

      </div>
    </div>,
    document.body
  );
};

export default BannerColorModal;