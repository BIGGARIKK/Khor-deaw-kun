import { useState, useRef, useEffect } from 'react';
import { TbEdit, TbCheck, TbX, TbTrash } from "react-icons/tb";
import { apiRequest } from "../../../service/api"; 
import './ProfileHeader.css';

const ProfileHeader = ({ userData, setUserData, bannerColor, setIsColorModalOpen, avatarImage, setIsAvatarModalOpen, avatarPresets, isOwnProfile = true }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');

  // 🌟 State สำหรับระบบ Online Status
  const [status, setStatus] = useState(userData?.online_status || 'online');
  const statusRef = useRef(status); 
  
  // 🌟 จำค่าที่ผู้ใช้กดล็อคด้วยตัวเอง (เก็บลง localStorage เพื่อให้จำข้ามการรีเฟรชได้)
  const manualStatusRef = useRef(localStorage.getItem('manual_status') || null); 

  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);
  const [phraseIndices, setPhraseIndices] = useState(Array(9).fill(0));
  const [isFollowing, setIsFollowing] = useState(false);
  
  const myLoggedInUsername = localStorage.getItem('username'); 

  useEffect(() => {
    if (userData?.followers && myLoggedInUsername) {
      setIsFollowing(userData.followers.includes(myLoggedInUsername));
    }
    if (userData && userData.online_status) {
      setStatus(userData.online_status);
      statusRef.current = userData.online_status;
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

  // 🌟 ฟังก์ชันเปลี่ยนสถานะแบบแยกระบบ Auto / Manual
  const handleStatusChange = async (newStatus, isManual = false) => {
    if (statusRef.current === newStatus && !isManual) return; 

    setStatus(newStatus);
    statusRef.current = newStatus;

    if (isManual) {
      if (newStatus === 'online') {
        // ถ้ากดเลือก Online ให้ยกเลิกการล็อค แล้วกลับไปใช้ระบบตรวจจับออโต้
        manualStatusRef.current = null;
        localStorage.removeItem('manual_status');
      } else {
        // ถ้าเลือกสีอื่น (เหลือง, แดง, เทา) ให้ "ล็อค" สีนั้นไว้ตลอดกาล
        manualStatusRef.current = newStatus;
        localStorage.setItem('manual_status', newStatus);
      }
      setIsStatusMenuOpen(false);
    }

    if (isOwnProfile) {
      try {
        await apiRequest('/profile', 'PUT', { online_status: newStatus });
        if (setUserData) setUserData(prev => ({ ...prev, online_status: newStatus }));
      } catch (error) {
        console.error("Failed to update status", error);
      }
    }
  };

  // 🌟 ระบบตรวจจับ (จะทำงานก็ต่อเมื่อไม่ได้ "ล็อค" สถานะไว้)
  useEffect(() => {
    if (!isOwnProfile) return;

    let awayTimer;
    let busyTimer;

    const resetActivityTimers = () => {
      // 🛑 ถ้ามีการล็อคค่าเอาไว้ (manualStatusRef มีค่า) ให้หยุดการทำงานตรงนี้ไปเลย
      if (manualStatusRef.current) return;

      clearTimeout(awayTimer);
      clearTimeout(busyTimer);

      if (statusRef.current !== 'online') {
         handleStatusChange('online', false);
      }

      awayTimer = setTimeout(() => {
        if (!manualStatusRef.current && statusRef.current === 'online') {
          handleStatusChange('away', false);
        }
      }, 30 * 1000);

      busyTimer = setTimeout(() => {
        if (!manualStatusRef.current && (statusRef.current === 'online' || statusRef.current === 'away')) {
          handleStatusChange('busy', false);
        }
      }, 60 * 1000);
    };

    const handleVisibilityChange = () => {
      if (manualStatusRef.current) return; // ถ้าล็อคไว้ ไม่ต้องสนใจว่าสลับแท็บหรือไม่
      if (document.hidden) {
        handleStatusChange('offline', false);
      } else {
        resetActivityTimers();
      }
    };

    const handleWindowBlur = () => {
      if (manualStatusRef.current) return; 
      handleStatusChange('offline', false);
    };

    const handleWindowFocus = () => {
      if (manualStatusRef.current) return;
      if (!document.hidden) {
        resetActivityTimers();
      }
    };

    // ตอนเปิดเว็บมาครั้งแรก ให้เช็คว่าเคยล็อคค่าไว้ไหม ถ้าล็อคก็ให้ยิง API แจ้งหลังบ้านเลย
    if (manualStatusRef.current) {
       handleStatusChange(manualStatusRef.current, false);
    } else {
       resetActivityTimers();
    }

    window.addEventListener('mousemove', resetActivityTimers);
    window.addEventListener('keydown', resetActivityTimers);
    window.addEventListener('click', resetActivityTimers);
    window.addEventListener('scroll', resetActivityTimers);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      clearTimeout(awayTimer);
      clearTimeout(busyTimer);
      window.removeEventListener('mousemove', resetActivityTimers);
      window.removeEventListener('keydown', resetActivityTimers);
      window.removeEventListener('click', resetActivityTimers);
      window.removeEventListener('scroll', resetActivityTimers);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [isOwnProfile]);

  const handleEditClick = () => {
    setEditName(userData.display_name || userData.username);
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

  const handleSave = async () => {

    if (!editName || editName.trim() === '') {
      alert("Please enter your name! 📝");
      return; // สั่งหยุดทำงาน ไม่ให้ไปต่อ
    }

    if (setUserData) {
      try {
        // 🌟 ส่ง display_name ไปที่ Backend
        await apiRequest('/profile', 'PUT', { bio: editBio, display_name: editName });
        
        // 🌟 อัปเดต State ให้หน้าจอเปลี่ยนตามทันที
        setUserData(prev => ({ ...prev, bio: editBio, display_name: editName }));
        
        // 🌟 เก็บลง LocalStorage เพื่อให้หน้าอื่นดึงไปใช้ง่ายๆ
        localStorage.setItem('display_name', editName);
        
        setIsEditing(false);
      } catch (error) {
        console.error("Failed to save bio or name:", error);
        alert("บันทึกข้อมูลไม่สำเร็จ!");
      }
    }

    const newUsername = editName.trim();
    const newBio = editBio.trim();

    try {
      // 🌟 ยิง API ไปอัปเดตลง Database (คุณอาจจะต้องเช็คฝั่ง Backend ด้วยว่ารับค่า bio และ username หรือยัง)
      await apiRequest('/profile', 'PUT', { 
        username: newUsername, 
        bio: newBio 
      });

      // 🌟 อัปเดต LocalStorage หากมีการเปลี่ยน Username (สำคัญมากสำหรับระบบ Login)
      if (newUsername !== myLoggedInUsername) {
        localStorage.setItem('username', newUsername);
      }

      // 🌟 อัปเดตข้อมูลบนหน้าจอ
      setUserData(prev => ({ ...prev, username: newUsername, bio: newBio }));
      setIsEditing(false);

    } catch (error) {
      console.error("Failed to update profile info:", error);
      alert("บันทึกข้อมูลไม่สำเร็จ ลองใหม่อีกครั้งนะครับ 😅");
    }
  };

  const handleToggleFollow = async () => {
    try {
      const response = await apiRequest(`/users/${userData.username}/follow`, 'POST');
      
      setIsFollowing(response.is_following);

      setUserData(prev => {
        let updatedFollowers = [...(prev.followers || [])];
        if (response.is_following) {
          updatedFollowers.push(myLoggedInUsername);
        } else {
          updatedFollowers = updatedFollowers.filter(name => name !== myLoggedInUsername);
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
                      onClick={() => handleStatusChange(key, true)} // 🌟 ส่ง true เพื่อบอกว่าคนกดเปลี่ยนเอง
                    >
                      <div className="status-color-circle" style={{ backgroundColor: value.color }}></div>
                      {value.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

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
           {userData.display_name || userData.username}
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