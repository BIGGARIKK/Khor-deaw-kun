import './StoryModal.css';
import { createPortal } from 'react-dom';

const StoryModal = ({ 
  setIsStoryOpen, stories, currentStoryIndex, fileInputRef, 
  handleDeleteStory, handleStoryNavigation, handleFileChange, 
  storyProgress, handlePointerDown, handlePointerUp, setIsPaused, 
  handleAddStoryClick
}) => { // 👈 1. ต้องมีปีกกาเปิดตรงนี้
  
  return createPortal( // 👈 2. ต้องมี return createPortal( ตรงนี้
    <div className="ig-story-overlay" onClick={() => setIsStoryOpen(false)}>
      <div className="ig-story-container" onClick={(e) => e.stopPropagation()}>
        <div className="story-top-shadow"></div>
        
        {/* 1. ส่วนแถบ Progress Bar ด้านบนสุด */}
        <div className="story-progress-container">
          {stories.map((_, index) => (
            <div key={index} className="story-progress-bg">
              <div
                className="story-progress-bar"
                style={{width: index === currentStoryIndex ? `${storyProgress}%` : index < currentStoryIndex ? '100%' : '0%'}}
              ></div>
            </div>
          ))}
        </div>

        {/* 2. ส่วน Header: ชื่อผู้ใช้และปุ่มควบคุม */}
        <div className="story-header">
          <div className="story-user-info">
          </div>
          
          <div className="story-controls">
            <button className="btn-add-story-circle" onClick={handleAddStoryClick} title="Add Story">+</button>
            <button className="btn-delete-story-circle" onClick={handleDeleteStory} title="Delete"> - </button>
          </div>
        </div>
        <div 
          className="story-click-wrapper" 
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={() => setIsPaused(false)}
          onPointerCancel={() => setIsPaused(false)}
        >
          {stories.length > 0 ? (
            <img 
              src={stories[currentStoryIndex]} 
              alt="Story" 
              className="story-full-img" 
              draggable="false" 
            />
          ) : (
            <div className="story-empty">
              <p>No story</p>
            </div>
          )}
        </div>

        {/* Input ไฟล์ (ซ่อนไว้) */}
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
        
      </div>
    </div>,
    document.body
  );
};

export default StoryModal;