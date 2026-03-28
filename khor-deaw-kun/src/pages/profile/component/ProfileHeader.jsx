import { useState, useRef, useEffect } from 'react';
import { TbEdit, TbCheck, TbX, TbTrash } from "react-icons/tb";
import { apiRequest } from "../../../service/api"; // 🌟 อย่าลืม import API Request
import './ProfileHeader.css';

const ProfileHeader = ({ userData, setUserData, bannerColor, setIsColorModalOpen, avatarImage, setIsAvatarModalOpen, avatarPresets, isOwnProfile = true }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');

  const [status, setStatus] = useState('online');
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);
  const [phraseIndices, setPhraseIndices] = useState(Array(9).fill(0));
  
  const [isFollowing, setIsFollowing] = useState(false);
  
  // 🌟 ดึงชื่อของเราที่ล็อกอินอยู่
  const myLoggedInUsername = localStorage.getItem('username'); 

  // 🌟 เช็คสถานะเริ่มต้นว่าเรา Follow เขาอยู่หรือเปล่า
  useEffect(() => {
    if (userData?.followers && myLoggedInUsername) {
      setIsFollowing(userData.followers.includes(myLoggedInUsername));
    }
  }, [userData, myLoggedInUsername]);

  const allAvatarPhrases = [
    ["What's up! 😎", "Nice to meet you!", "Looking good today!"],
    ["Need more coffee ☕", "I need boyfriend !", "I luv u ❤️"],
    ["I am broccoli 🥦", "Eat your greens!", "So healthy!"],
    ["Beep Boop 🤖", "System Online", "Error 404: Sleep not found"],
    ["Roar! 🐉", "Dragon Power!", "Feeling hot!"],
    ["Take me to your leader 👽", "Area 51 survivor", "Hello Earthling"],
    ["Hello there! ✨", "Have a nice day", "You're awesome!"],
    ["Nice to meet you! 💖", "Sending love", "Stay positive!"],
    ["!#$@#$%", "Rawrr!", ":D"]
  ];

  const currentAvatarIndex = avatarPresets?.indexOf(avatarImage) !== -1 
    ? avatarPresets?.indexOf(avatarImage) 
    : 0;

  const statusConfig = {
    online: { color: '#84E045', label: 'Online' },    
    away: { color: '#ffe066', label: 'Away' },        
    busy: { color: '#ff4d4d', label: 'Busy' },        
    offline: { color: '#aaaaaa', label: 'Offline' }   
  };

  const handleEditClick = () => {
    setEditName(userData.username);
    setEditBio(userData.bio || "");
    setIsEditing(true);
  };

  const handleBioChange = (e) => {
    const text = e.target.value;
    const lines = text.split('\n');
    if (lines.length <= 3) {
      setEditBio(text);
    }
  };

  const handleSave = () => {
    if (!editName || editName.trim() === '') {
      alert("Please enter your name!");
      return;
    }
    setUserData(prev => ({ ...prev, username: editName.trim(), bio: editBio }));
    setIsEditing(false);
  };

  // 🌟 ฟังก์ชันจัดการปุ่ม Follow โดยยิง API และอัปเดตตัวเลข
  const handleToggleFollow = async () => {
    try {
      const response = await apiRequest(`/users/${userData.username}/follow`, 'POST');
      
      // เปลี่ยนสีและข้อความปุ่ม
      setIsFollowing(response.is_following);

      // 🌟 อัปเดตตัวเลข Follower เข้าไปใน userData (ทำให้แถบซ้ายตัวเลขเด้งขึ้นทันที)
      setUserData(prev => {
        let updatedFollowers = [...(prev.followers || [])];
        if (response.is_following) {
          updatedFollowers.push(myLoggedInUsername); // ถ้าฟอล ให้เพิ่มชื่อเรา
        } else {
          updatedFollowers = updatedFollowers.filter(name => name !== myLoggedInUsername); // ถ้าอันฟอล ให้ลบชื่อเราออก
        }
        return { ...prev, followers: updatedFollowers };
      });

    } catch (error) {
      console.error("Failed to follow/unfollow:", error);
      alert("มีข้อผิดพลาด ไม่สามารถติดตามได้");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsStatusMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="wooden-box profile-header-card" style={{ '--status-color': statusConfig[status].color }}>
      <div
        className="profile-cover"
        onClick={() => isOwnProfile && setIsColorModalOpen(true)}
        style={{ 
          cursor: isOwnProfile ? 'pointer' : 'default', 
          backgroundColor: typeof bannerColor === 'object' ? bannerColor.color : bannerColor,
          backgroundImage: typeof bannerColor === 'object' ? bannerColor.pattern : 'none',
          backgroundSize: typeof bannerColor === 'object' ? bannerColor.size : 'auto',
          backgroundPosition: typeof bannerColor === 'object' ? (bannerColor.position || '0 0') : '0 0'
        }}
      ></div>
      
      <div className="profile-header-content">
        
        <div className="left-profile-col">
          <div 
            className="avatar-wrapper"
            onMouseEnter={() => {
              setPhraseIndices(prev => {
                const newIndices = [...prev];
                const currentPhrases = allAvatarPhrases[currentAvatarIndex];
                newIndices[currentAvatarIndex] = (newIndices[currentAvatarIndex] + 1) % currentPhrases.length;
                return newIndices;
              });
              setIsHoveringAvatar(true);
            }}
            onMouseLeave={() => setIsHoveringAvatar(false)}
          >

            {isHoveringAvatar && !isStatusMenuOpen && status === 'online' && (
              <div key={phraseIndices[currentAvatarIndex]} className="main-avatar-speech-bubble">
                {allAvatarPhrases[currentAvatarIndex][phraseIndices[currentAvatarIndex]]}
              </div>
            )}
            
            <img 
              src={avatarImage} 
              alt="avatar" 
              className="avatar" 
              onClick={() => isOwnProfile && setIsAvatarModalOpen(true)} 
              style={{ cursor: isOwnProfile ? 'pointer' : 'default' }}
            />
            
            <div className="status-container" ref={menuRef}>
              <div 
                className="online-dot" 
                title={isOwnProfile ? "Change Status" : statusConfig[status].label}
                onClick={(e) => { 
                  if (!isOwnProfile) return; 
                  e.stopPropagation(); 
                  setIsStatusMenuOpen(!isStatusMenuOpen); 
                }}
                style={{ cursor: isOwnProfile ? 'pointer' : 'default' }}
              ></div>
              
              {isStatusMenuOpen && (
                <div className="status-menu">
                  {Object.entries(statusConfig).map(([key, value]) => (
                    <div 
                      key={key} 
                      className="status-option"
                      onClick={() => {
                        setStatus(key); 
                        setIsStatusMenuOpen(false); 
                      }}
                    >
                      <div className="status-color-circle" style={{ backgroundColor: value.color }}></div>
                      {value.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 🌟 ปรับให้เรียกใช้ฟังก์ชันใหม่ (ยิง API แทนการสลับ State ธรรมดา) */}
          {!isOwnProfile && (
            <button 
              className={`doodle-follow-btn ${isFollowing ? 'following' : ''}`}
              onClick={handleToggleFollow}
            >
              {isFollowing ? 'Following ' : 'Follow '}
            </button>
          )}

        </div>
        
        <div className="profile-text-info">
          {isEditing ? (
            <div className="edit-profile-form">
              <div className="input-wrapper">
                <input
                  type="text"
                  className={`doodle-input edit-name-input ${(editName || '').length >= 10 ? 'input-full' : ''}`}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Your Name ..."
                  maxLength={10}
                />
                <span className={`char-counter ${(editName || '').length >= 10 ? 'text-red' : ''}`}>
                  {(editName || '').length}/10
                </span>
              </div>

              <div className="input-wrapper">
                <textarea
                  className={`doodle-input edit-bio-input ${(editBio || '').length >= 30 ? 'input-full' : ''}`}
                  value={editBio}
                  onChange={handleBioChange}
                  placeholder="description ..."
                  maxLength={30}
                />
                <span className={`char-counter ${(editBio || '').length >= 30 ? 'text-red' : ''}`}>
                  {(editBio || '').length}/30
                </span>
              </div>

              <div className="edit-actions">
                <button className="doodle-btn btn-save" onClick={handleSave}><TbCheck size={18}/> save</button>
                <button className="doodle-btn btn-cancel" onClick={() => setIsEditing(false)}><TbX size={18}/> cancel</button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="profile-name">
                <span 
                  className="highlight-text"
                  style={{ color: typeof bannerColor === 'object' ? bannerColor.color : bannerColor }}
                >
                  {userData.username}
                </span> 
              </h1>
              <p className="profile-bio">{userData?.bio || ""}</p>
            </>
          )}
        </div>
      </div>

      {isOwnProfile && !isEditing && (
        <button className="doodle-btn btn-edit-profile" onClick={handleEditClick}>
          <TbEdit size={20} /> Edit
        </button>
      )}

    </div>
  );
};

export default ProfileHeader;