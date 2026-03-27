import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../service/api';
import { TbChevronLeft, TbChevronRight } from "react-icons/tb";
import PostCard from '../Feed/component/feed/PostCard';
import './profile.css';

import LeftPanel from './component/LeftPanel';
import ProfileHeader from './component/ProfileHeader';
import RightPanel from './component/RightPanel';
// ✨ เพิ่มการ Import MyPosts ที่นี่
import MyPosts from './component/MyPosts'; 

import AvatarModal from './component/AvatarModal';
import StoryModal from './component/StoryModal';
import BannerColorModal from './component/BannerColorModal';

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
  { id: 2, color: '#6de6e6', pattern: 'radial-gradient(rgba(255,255,255,0.6) 15%, transparent 16%), radial-gradient(rgba(255,255,255,0.6) 15%, transparent 16%)', size: '20px 20px', position: '0 0, 10px 10px' },
  { id: 3, color: '#ffe066', pattern: 'linear-gradient(rgba(255,255,255,0.5) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.5) 2px, transparent 2px)', size: '20px 20px' },
  { id: 4, color: '#84e045', pattern: 'linear-gradient(45deg, rgba(255,255,255,0.5) 2px, transparent 2px), linear-gradient(-45deg, rgba(255,255,255,0.5) 2px, transparent 2px)', size: '15px 15px' },
  { id: 5, color: '#50ade2', pattern: 'repeating-linear-gradient(-45deg, rgba(255,255,255,0.3) 0px, rgba(255,255,255,0.3) 15px, transparent 15px, transparent 30px)', size: '100% 100%' },
  { id: 6, color: '#b088f9', pattern: 'radial-gradient(circle at 0 0, rgba(255,255,255,0.4) 50%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(255,255,255,0.4) 50%, transparent 50%)', size: '30px 30px' },
  { id: 7, color: '#ff99c8', pattern: 'repeating-radial-gradient(circle, transparent, transparent 10px, rgba(255,255,255,0.4) 10px, rgba(255,255,255,0.4) 20px)', size: '100% 100%' },
  { id: 8, color: '#a0c4ff', pattern: 'linear-gradient(45deg, rgba(255,255,255,0.4) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.4) 75%, rgba(255,255,255,0.4)), linear-gradient(45deg, rgba(255,255,255,0.4) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.4) 75%, rgba(255,255,255,0.4))', size: '20px 20px', position: '0 0, 10px 10px' },
  { id: 9, color: '#fdffb6', pattern: 'repeating-linear-gradient(transparent, transparent 10px, rgba(255,255,255,0.5) 10px, rgba(255,255,255,0.5) 20px), repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(255,255,255,0.5) 10px, rgba(255,255,255,0.5) 20px)', size: '100% 100%' },
  { id: 10, color: '#caffbf', pattern: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.5) 0, rgba(255,255,255,0.5) 15px, transparent 15px, transparent 30px)', size: '100% 100%' },
  { id: 11, color: '#ffd6a5', pattern: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.4) 0, rgba(255,255,255,0.4) 10px, transparent 10px, transparent 20px)', size: '100% 100%' },
  { id: 12, color: '#30795d', pattern: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.1) 0, rgba(255,255,255,0.1) 5px, transparent 5px, transparent 10px)', size: '100% 100%' }
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
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);

  const avatarPresets = [myAv1, myAv2, myAv3, myAv4, myAv5, myAv6, myAv7, myAv8, myAv9];
  const [avatarImage, setAvatarImage] = useState(() => {
    const randomIndex = Math.floor(Math.random() * avatarPresets.length);
    return avatarPresets[randomIndex];
  });
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const pressTimer = useRef(0);

  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const [storyProgress, setStoryProgress] = useState(0);

  const [currentPostIndex, setCurrentPostIndex] = useState(0);

  const userPosts = [
    { id: 1, time: "1 min ago", text: "หยุดน่ารักได้มั้ย ใจเราก็แค่นี้อะ 🥺 #รักน้องแมวมาก", hasImage: true, imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", likes: 105, comments: 20 },
    { id: 2, time: "2 hours ago", text: "วันนี้เขียนโค้ดทั้งวันเลย สมองเบลอไปหมดแล้ววว 💻😵‍💫", hasImage: false, imageUrl: "", likes: 42, comments: 5 },
    { id: 3, time: "Yesterday", text: "แวะมากินของอร่อยๆ เยียวยาจิตใจ 🍜✨", hasImage: true, imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", likes: 210, comments: 45 },
    { id: 4, time: "3 days ago", text: "บางทีการได้พักผ่อนเงียบๆ โง่ๆ ก็ชาร์จพลังได้ดีนะ 🔋😴", hasImage: false, imageUrl: "", likes: 89, comments: 12 },
    { id: 5, time: "Last week", text: "รอคอยให้ถึงวันหยุดเสาร์อาทิตย์ไม่ไหวแล้ววว อยากนอนนน", hasImage: false, imageUrl: "", likes: 55, comments: 2 },
    { id: 6, time: "2 weeks ago", text: "ช่วงนี้ติดดูอนิเมะหนักมาก ดูโต้รุ่งมา 2 วันติดแล้ว 🎬🍿", hasImage: false, imageUrl: "", likes: 112, comments: 18 },
    { id: 7, time: "3 weeks ago", text: "อยากกินชาบูเยียวยาจิตใจจังเลยยยยยยยยย 🥓🔥", hasImage: false, imageUrl: "", likes: 230, comments: 55 },
    { id: 8, time: "1 month ago", text: "ฝนตกหนักมาก รักษาสุขภาพกันด้วยนะครับทุกคน 🌧️🤧", hasImage: false, imageUrl: "", likes: 78, comments: 4 },
    { id: 9, time: "1 month ago", text: "เริ่มวันใหม่ด้วยกาแฟหอมๆ สักแก้ว ☕️🌿", hasImage: true, imageUrl: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", likes: 145, comments: 22 },
    { id: 10, time: "2 months ago", text: "นานๆ ทีได้ออกมารับอากาศบริสุทธิ์ ธรรมชาติบำบัดสุดๆ ⛰️🌲", hasImage: true, imageUrl: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", likes: 320, comments: 45 },
    { id: 11, time: "2 months ago", text: "มุมโปรดเวลาปั่นงาน จัดโต๊ะใหม่เรียบร้อย น่านั่งขึ้นเยอะ 💻✨", hasImage: true, imageUrl: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", likes: 88, comments: 14 },
    { id: 12, time: "3 months ago", text: "เจอเจ้านี่เดินเตาะแตะอยู่แถวบ้าน น่ารักเกินต้านทาน 🐶❤️", hasImage: true, imageUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", likes: 412, comments: 65 },
    { id: 13, time: "3 months ago", text: "เติมน้ำตาลให้ร่างกายหน่อย เค้กร้านนี้อร่อยมากกกก 🍰🍓", hasImage: true, imageUrl: "https://images.unsplash.com/photo-1551024601-bec78aea704b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", likes: 275, comments: 38 }
  ];

  const imagePosts = userPosts.filter(post => post.hasImage);
  const textPosts = userPosts.filter(post => !post.hasImage);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await apiRequest('/profile', 'GET');
        setUserData(data);

        // ดึงรูปที่เซฟไว้ใน DB มาโชว์ (ถ้ามี)
        if (data && data.profile_image) {
          const match = data.profile_image.match(/\d+/);
          if (match) {
            const index = parseInt(match[0], 10) - 1;
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

  const handleUpdateAvatar = async (selectedAvatar) => {
    setAvatarImage(selectedAvatar);

    try {
      const avatarIndex = avatarPresets.indexOf(selectedAvatar);
      const fileName = avatarIndex !== -1 ? `${avatarIndex + 1}.png` : '1.png';

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
    return () => document.body.style.overflow = '';
  }, [isColorModalOpen, isAvatarModalOpen, isStoryOpen]);

  if (!userData) {
    return (
      <div className="profile-page">
        <div className="doodle-box loading-box">Loading Profile... ⏳</div>
      </div>
    );
  }

  const handleFileChange = (e) => {
    if (stories.length >= 10) {
      alert("You can upload up to 10 stories only! 📸");
      return;
    }

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
        
        {/* ✨ คอลัมน์ซ้าย (1fr) */}
        <div className="left-panel-wrapper">
          <LeftPanel
            navigate={navigate}
            userData={userData}
            isContactOpen={isContactOpen}
            setIsContactOpen={setIsContactOpen}
          />
        </div>

        {/* ✨ คอลัมน์กลาง (2.2fr ใหญ่สุด) */}
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

          <div className="feed-carousel-section">
            {currentPostIndex > 0 && imagePosts.length > 0 && (
              <button
                type="button"
                className="carousel-btn prev-btn"
                onClick={() => setCurrentPostIndex(prev => prev - 1)}
              >
                <TbChevronLeft size={28} />
              </button>
            )}

            <div className="carousel-content">
              {imagePosts.length > 0 ? (
                <PostCard
                  author={userData.username}
                  time={imagePosts[currentPostIndex].time}
                  text={imagePosts[currentPostIndex].text}
                  hasImage={imagePosts[currentPostIndex].hasImage}
                  imageUrl={imagePosts[currentPostIndex].imageUrl}
                  likes={imagePosts[currentPostIndex].likes}
                  comments={imagePosts[currentPostIndex].comments}
                />
              ) : (
                <div className="doodle-box loading-box">No image posts yet 📸</div>
              )}
            </div>

            {currentPostIndex < imagePosts.length - 1 && imagePosts.length > 0 && (
              <button
                type="button"
                className="carousel-btn next-btn"
                onClick={() => setCurrentPostIndex(prev => prev + 1)}
              >
                <TbChevronRight size={28} />
              </button>
            )}
          </div>
        </div>

        {/* ✨ คอลัมน์ขวา (1fr) */}
        <div className="right-panel-wrapper">
          <RightPanel
            stories={stories}
            setIsStoryOpen={() => {
              setCurrentStoryIndex(0);
              setStoryProgress(0);
              setIsStoryOpen(true);
            }}
          />

          {/* ✨ เรียกใช้ Component MyPosts ที่เราแยกมาแล้วส่ง Props ให้มัน */}
          <MyPosts textPosts={textPosts} username={userData.username} />
          
        </div>

      </div>

      {isColorModalOpen && <BannerColorModal setIsColorModalOpen={setIsColorModalOpen} bannerColor={bannerColor} setBannerColor={setBannerColor} bannerPresets={BANNER_PRESETS} />}
      {isAvatarModalOpen && <AvatarModal setIsAvatarModalOpen={setIsAvatarModalOpen} avatarPresets={avatarPresets} avatarImage={avatarImage} setAvatarImage={setAvatarImage} />}
      {isStoryOpen && <StoryModal setIsStoryOpen={setIsStoryOpen} stories={stories} currentStoryIndex={currentStoryIndex} fileInputRef={fileInputRef} handleDeleteStory={handleDeleteStory} handleStoryNavigation={handleStoryNavigation} handleFileChange={handleFileChange} storyProgress={storyProgress} handlePointerDown={handlePointerDown} handlePointerUp={handlePointerUp} setIsPaused={setIsPaused} handleAddStoryClick={handleAddStoryClick} />}
    </div>
  );
};

export default Profile;