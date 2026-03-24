import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../service/api';
import { TbArrowUp } from "react-icons/tb";
import PostCard from '../Feed/component/feed/PostCard';
import './profile.css';

import LeftPanel from './component/LeftPanel';
import ProfileHeader from './component/ProfileHeader';
import RightPanel from './component/RightPanel';
import AvatarModal from './component/AvatarModal';
import StoryModal from './component/StoryModal';
import BannerColorModal from './component/BannerColorModal';

// นำเข้ารูป Avatar
import myAv1 from '../../assets/avatars/1.png';
import myAv2 from '../../assets/avatars/2.png';
import myAv3 from '../../assets/avatars/3.png';
import myAv4 from '../../assets/avatars/4.png';
import myAv5 from '../../assets/avatars/5.png';
import myAv6 from '../../assets/avatars/6.png';
import myAv7 from '../../assets/avatars/7.png';
import myAv8 from '../../assets/avatars/8.png';
import myAv9 from '../../assets/avatars/9.png';

export const BANNER_PRESETS = [
  { id: 1, color: '#ffb8b8', pattern: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.4) 0px, rgba(255,255,255,0.4) 15px, transparent 15px, transparent 30px)', size: '100% 100%' },
  { id: 2, color: '#ff9f43', pattern: 'radial-gradient(rgba(255,255,255,0.6) 15%, transparent 16%), radial-gradient(rgba(255,255,255,0.6) 15%, transparent 16%)', size: '20px 20px', position: '0 0, 10px 10px' },
  { id: 3, color: '#ffe066', pattern: 'linear-gradient(rgba(255,255,255,0.5) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.5) 2px, transparent 2px)', size: '20px 20px' },
  { id: 4, color: '#84e045', pattern: 'linear-gradient(45deg, rgba(255,255,255,0.5) 2px, transparent 2px), linear-gradient(-45deg, rgba(255,255,255,0.5) 2px, transparent 2px)', size: '15px 15px' },
  { id: 5, color: '#50ade2', pattern: 'repeating-linear-gradient(-45deg, rgba(255,255,255,0.3) 0px, rgba(255,255,255,0.3) 15px, transparent 15px, transparent 30px)', size: '100% 100%' },
  { id: 6, color: '#b088f9', pattern: 'radial-gradient(circle at 0 0, rgba(255,255,255,0.4) 50%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(255,255,255,0.4) 50%, transparent 50%)', size: '30px 30px' },
  { id: 7, color: '#ff99c8', pattern: 'repeating-radial-gradient(circle, transparent, transparent 10px, rgba(255,255,255,0.4) 10px, rgba(255,255,255,0.4) 20px)', size: '100% 100%' },
  { id: 8, color: '#a0c4ff', pattern: 'linear-gradient(45deg, rgba(255,255,255,0.4) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.4) 75%, rgba(255,255,255,0.4)), linear-gradient(45deg, rgba(255,255,255,0.4) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.4) 75%, rgba(255,255,255,0.4))', size: '20px 20px', position: '0 0, 10px 10px' },
  { id: 9, color: '#fdffb6', pattern: 'repeating-linear-gradient(transparent, transparent 10px, rgba(255,255,255,0.5) 10px, rgba(255,255,255,0.5) 20px), repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(255,255,255,0.5) 10px, rgba(255,255,255,0.5) 20px)', size: '100% 100%' },
  { id: 10, color: '#caffbf', pattern: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.5) 0, rgba(255,255,255,0.5) 15px, transparent 15px, transparent 30px)', size: '100% 100%' },
  { id: 11, color: '#ffd6a5', pattern: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.4) 0, rgba(255,255,255,0.4) 10px, transparent 10px, transparent 20px)', size: '100% 100%' },
  { id: 12, color: '#222222', pattern: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.1) 0, rgba(255,255,255,0.1) 5px, transparent 5px, transparent 10px)', size: '100% 100%' }
];

const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [bannerColor, setBannerColor] = useState(() => {
    const randomIndex = Math.floor(Math.random() * BANNER_PRESETS.length);
    return BANNER_PRESETS[randomIndex];
  });
  const colorInputRef = useRef(null);
  const [stories, setStories] = useState([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const fileInputRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);

  const avatarPresets = [myAv1, myAv2, myAv3, myAv4, myAv5, myAv6, myAv7, myAv8, myAv9];
  
  // ตอนแรกให้เป็นค่าเริ่มต้นไว้ก่อน เดี๋ยว useEffect จะมาดึงจาก DB ให้
  const [avatarImage, setAvatarImage] = useState(avatarPresets[0]);
  
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const pressTimer = useRef(0);

  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const [storyProgress, setStoryProgress] = useState(0);

  // 🌟 1. ดึงข้อมูล User จาก Database ตอนเปิดหน้าเว็บ
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await apiRequest('/profile', 'GET');
        setUserData(data);

        // ดึงรูปที่เซฟไว้ใน DB มาโชว์ (ถ้ามี)
        if (data && data.profile_image) {
          const match = data.profile_image.match(/\d+/); // ดึงตัวเลขจาก '3.png'
          if (match) {
            const index = parseInt(match[0], 10) - 1; // ลบ 1 เพื่อให้ตรงกับ index ของ Array
            if (index >= 0 && index < avatarPresets.length) {
              setAvatarImage(avatarPresets[index]);
            }
          }
        }
      } catch (error) {
        alert(error.message || 'Failed to fetch profile data!');
      }
    };
    loadProfile();
  }, []);

  // 🌟 2. ฟังก์ชันอัปเดตรูป Avatar ไปยัง Database
  const handleUpdateAvatar = async (selectedAvatar) => {
    setAvatarImage(selectedAvatar); // เปลี่ยนรูปบนหน้าเว็บให้ดูก่อนทันที (ลื่นไหล)

    try {
      // ค้นหาว่ารูปที่เลือกคือไฟล์ชื่ออะไร (เช่น 1.png, 2.png)
      const avatarIndex = avatarPresets.indexOf(selectedAvatar);
      const fileName = avatarIndex !== -1 ? `${avatarIndex + 1}.png` : '1.png';

      // ยิง API (PUT) ไปบอก Backend ให้เซฟรูปนี้
      await apiRequest('/profile', 'PUT', {
        profile_image: fileName
      });
      console.log("Avatar updated in Database:", fileName);

    } catch (error) {
      console.error("Failed to update avatar:", error);
      alert("บันทึกรูปไม่สำเร็จ ลองใหม่อีกครั้งนะครับ 😅");
    }
  };

  const handlePointerDown = () => {
    setIsPaused(true);
    pressTimer.current = Date.now();
  };

  const handlePointerUp = (e) => {
    setIsPaused(false); 
    const holdDuration = Date.now() - pressTimer.current;
    if (holdDuration < 200) {
      handleStoryNavigation(e);
    }
  };

  const handleAddStoryClick = () => {
    setIsPaused(true); 
    fileInputRef.current.click(); 

    window.addEventListener('focus', () => {
      setTimeout(() => {
        setIsPaused(false); 
      }, 500);
    }, { once: true }); 
  };

  useEffect(() => {
    let timer;
    if (isStoryOpen && !isPaused && stories.length > 0) {
      timer = setInterval(() => {
        setStoryProgress((prev) => {
          const nextProgress = prev + (100 / 30);
          if (nextProgress >= 100) return 100;
          return nextProgress;
        });
      }, 100); 
    }
    return () => clearInterval(timer);
  }, [isStoryOpen, isPaused, currentStoryIndex, stories.length]);

  useEffect(() => {
    if (storyProgress >= 100) {
      if (currentStoryIndex < stories.length - 1) {
        setCurrentStoryIndex((prev) => prev + 1); 
        setStoryProgress(0); 
      } else {
        setIsStoryOpen(false); 
        setCurrentStoryIndex(0); 
        setStoryProgress(0); 
      }
    }
  }, [storyProgress, currentStoryIndex, stories.length]);

  useEffect(() => {
    if (isColorModalOpen || isAvatarModalOpen || isStoryOpen) {
      document.body.style.overflow = 'hidden'; 
    } else {
      document.body.style.overflow = ''; 
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isColorModalOpen, isAvatarModalOpen, isStoryOpen]);

  if (!userData) {
    return (
      <div className="profile-page">
        <div className="doodle-box loading-box">Loading Profile... ⏳</div>
      </div>
    );
  }

  const handleAddStory = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setStories([...stories, imageUrl]);
      setCurrentStoryIndex(stories.length);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setStories((prev) => {
        const newStories = [...prev, imageUrl];
        setCurrentStoryIndex(newStories.length - 1); 
        return newStories;
      });
      setStoryProgress(0); 
      setIsStoryOpen(true);
    }
  };

  const handleDeleteStory = (e) => {
    e.stopPropagation();
    const newStories = stories.filter((_, index) => index !== currentStoryIndex);
    setStories(newStories);
    setStoryProgress(0);
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    } else if (newStories.length === 0) {
      setIsStoryOpen(false);
    }
  };

  const handleStoryNavigation = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 2) {
      if (currentStoryIndex > 0) setCurrentStoryIndex(currentStoryIndex - 1);
      setStoryProgress(0);
    } else {
      if (currentStoryIndex < stories.length - 1) {
        setCurrentStoryIndex(currentStoryIndex + 1);
        setStoryProgress(0);
      } else {
        setIsStoryOpen(false);
        setCurrentStoryIndex(0);
        setStoryProgress(0);
      }
    }
  };

  return (
    <div className="profile-page">
      <input
        type="color"
        ref={colorInputRef}
        style={{ display: 'none' }}
        onChange={(e) => setBannerColor(e.target.value)}
      />
      
      <div className="profile-container">
        <LeftPanel
          navigate={navigate}
          userData={userData}
          isContactOpen={isContactOpen}
          setIsContactOpen={setIsContactOpen}
        />

        <div className="center-panel">
          <ProfileHeader
            userData={userData}
            setUserData={setUserData} 
            bannerColor={bannerColor}
            setIsColorModalOpen={setIsColorModalOpen}
            avatarImage={avatarImage}
            setIsAvatarModalOpen={setIsAvatarModalOpen}
            avatarPresets={avatarPresets}
          />

          <div className="feed-section">
            <PostCard
              author={userData.username}
              time="1 min ago"
              text="หยุดน่ารักได้มั้ย ใจเราก็แค่นี้อะ 🥺 #รักน้องแมวมาก"
              hasImage={true}
              imageUrl="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              likes={105}
              comments={20}
            />
          </div>
        </div>

        <RightPanel setIsStoryOpen={() => {
          setCurrentStoryIndex(0); 
          setStoryProgress(0);     
          setIsStoryOpen(true);    
        }} 
      />
      </div>

      {isColorModalOpen && (
        <BannerColorModal
          setIsColorModalOpen={setIsColorModalOpen}
          bannerColor={bannerColor}
          setBannerColor={setBannerColor}
          bannerPresets={BANNER_PRESETS}
        />
      )}

      {/* 🌟 3. ส่งฟังก์ชัน handleUpdateAvatar ไปให้ Modal แทน */}
      {isAvatarModalOpen && (
        <AvatarModal
          setIsAvatarModalOpen={setIsAvatarModalOpen}
          avatarPresets={avatarPresets}
          avatarImage={avatarImage}
          setAvatarImage={handleUpdateAvatar} 
        />
      )}

      {isStoryOpen && (
        <StoryModal
          setIsStoryOpen={setIsStoryOpen}
          stories={stories}
          currentStoryIndex={currentStoryIndex}
          fileInputRef={fileInputRef}
          handleDeleteStory={handleDeleteStory}
          handleStoryNavigation={handleStoryNavigation}
          handleFileChange={handleFileChange}
          storyProgress={storyProgress}
          handlePointerDown={handlePointerDown}
          handlePointerUp={handlePointerUp}
          setIsPaused={setIsPaused}
          handleAddStoryClick={handleAddStoryClick}
        />
      )}
    </div>
  );
};

export default Profile;