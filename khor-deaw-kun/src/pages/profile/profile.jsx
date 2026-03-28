import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // 🌟 1. Import useParams เพิ่มเข้ามา
import { apiRequest } from '../../service/api';
import { TbChevronLeft, TbChevronRight } from "react-icons/tb";
import PostCard from '../Feed/component/feed/PostCard';
import './profile.css';

import LeftPanel from './component/LeftPanel';
import ProfileHeader from './component/ProfileHeader';
import RightPanel from './component/RightPanel';
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

// 🌟 ฟังก์ชันแปลงวันที่ให้ปลอดภัย ไม่ขึ้น Invalid
const formatDate = (dateString) => {
  if (!dateString) return 'ไม่ทราบเวลา';

  // ถ้า Python ส่งมาเป็น "2024-10-25 14:30:00" ให้เปลี่ยนช่องว่างเป็นตัว T
  const safeDateString = dateString.toString().replace(' ', 'T');
  const date = new Date(safeDateString);

  // เช็คอีกรอบว่าแปลงสำเร็จไหม ถ้าไม่สำเร็จให้คืนค่าเดิม
  if (isNaN(date.getTime())) return 'ไม่ทราบเวลา';

  return date.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric' // ถ้าไม่อยากได้ปี เอาบรรทัดนี้ออกได้ครับ
  });
};

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
  const { username } = useParams(); // 🌟 2. ดึง username จาก URL (ถ้ามี)

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

  const myLoggedInUsername = localStorage.getItem('username');

  // 🌟 3. หาเป้าหมาย: ถ้ามี username ใน URL ให้ดูคนนั้น ถ้าไม่มีให้ดูของตัวเอง
  const targetUser = username || myLoggedInUsername;

  // เช็คว่าหน้าที่กำลังดู คือหน้าของเราเองใช่ไหม (เพื่อเปิด/ปิดปุ่มแก้ไข)
  const checkIsOwnProfile = targetUser === myLoggedInUsername;

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

  const [userPosts, setUserPosts] = useState([]);

  useEffect(() => {
    if (!targetUser) return; // ถ้าไม่มีข้อมูล User ให้หยุดทำงาน

    const loadProfileAndPosts = async () => {
      try {
        // 🌟 4. ดึงข้อมูล Profile ตามชื่อเป้าหมาย
        const profileData = await apiRequest(`/profile/${targetUser}`, 'GET');
        setUserData(profileData);

        if (profileData && profileData.stories) {
          setStories(profileData.stories);
        }

        if (profileData && profileData.profile_image) {
          const match = profileData.profile_image.match(/\d+/);
          if (match) {
            const index = parseInt(match[0], 10) - 1;
            if (index >= 0 && index < avatarPresets.length) {
              setAvatarImage(avatarPresets[index]);
            }
          }
        }

        // 🌟 5. ดึงข้อมูล Post ตามชื่อเป้าหมาย
        const userPostsData = await apiRequest(`/posts/${targetUser}`, 'GET');

        if (userPostsData) {
          setUserPosts(userPostsData);
        }

      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    loadProfileAndPosts();
  }, [targetUser]); // 🌟 เปลี่ยนมาจับการเปลี่ยนแปลงของ targetUser แทน

  const imagePosts = userPosts.filter(post => post.image_url && post.image_url.trim() !== "");
  const textPosts = userPosts.filter(post => !post.image_url || post.image_url.trim() === "");

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
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;
        const newStories = [...stories, base64String];

        try {
          await apiRequest('/profile', 'PUT', { stories: newStories });

          setStories(newStories);
          setCurrentStoryIndex(newStories.length - 1);
          setStoryProgress(0);
          setIsStoryOpen(true);
        } catch (error) {
          console.error("Failed to save story:", error);
          alert("อัปโหลดสตอรี่ไม่สำเร็จ!");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteStory = async (e) => {
    e.stopPropagation();
    const newStories = stories.filter((_, index) => index !== currentStoryIndex);

    try {
      await apiRequest('/profile', 'PUT', { stories: newStories });

      setStories(newStories);
      setStoryProgress(0);
      if (currentStoryIndex > 0) {
        setCurrentStoryIndex(currentStoryIndex - 1);
      } else if (newStories.length === 0) {
        setIsStoryOpen(false);
      }
    } catch (error) {
      console.error("Failed to delete story:", error);
      alert("ลบสตอรี่ไม่สำเร็จ!");
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
            setUserData={setUserData}
            actualPostCount={userPosts.length}
            isContactOpen={isContactOpen}
            setIsContactOpen={setIsContactOpen}
            isOwnProfile={checkIsOwnProfile}
          />
        </div>

        <div className="center-panel">
          <ProfileHeader
            userData={userData}
            setUserData={setUserData}
            bannerColor={bannerColor}
            setIsColorModalOpen={setIsColorModalOpen}
            avatarImage={avatarImage}
            setIsAvatarModalOpen={setIsAvatarModalOpen}
            avatarPresets={avatarPresets}
            isOwnProfile={checkIsOwnProfile}
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

            {/* ในไฟล์ Profile.jsx ค้นหาช่วง <div className="carousel-content"> แล้วอัปเดต <PostCard /> ตามนี้ครับ */}

            <div className="carousel-content">
              {imagePosts.length > 0 ? (
                <PostCard
                  postId={imagePosts[currentPostIndex]._id}
                  author={imagePosts[currentPostIndex].author_username}

                  // 🌟 รูปโปรไฟล์: ถ้าโพสต์ไม่มีรูปคนเขียน ให้เอารูปของเจ้าของโปรไฟล์ (userData) มาแสดงแทน
                  image_author={imagePosts[currentPostIndex].author_image || userData?.profile_image}

                  // 🌟 เวลา: ใช้ฟังก์ชัน formatDate ที่เราเพิ่งทำกันไป เพื่อป้องกัน Invalid Date
                  time={formatDate(imagePosts[currentPostIndex].create_at)}

                  text={imagePosts[currentPostIndex].text}
                  hasImage={true} // เป็น true แน่นอนเพราะอยู่ในโหมด imagePosts
                  imageUrl={imagePosts[currentPostIndex].image_url}

                  // 🌟 ส่ง Array การกดไลก์และคอมเมนต์ไป
                  likes={imagePosts[currentPostIndex].likes || []}
                  comments={imagePosts[currentPostIndex].comment || []}

                  // 🌟 พระเอกของเรา: ส่งชื่อคนล็อกอินเข้าไป เพื่อให้ PostCard เช็คว่าปุ่มไลก์ต้องเป็นสีส้มหรือยัง!
                  currentUser={myLoggedInUsername}
                />
              ) : (
                <div className="doodle-box loading-box">ยังไม่มีโพสต์รูปภาพเลย 📸</div>
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

          <MyPosts
            textPosts={textPosts}
            username={userData.username}
            userAvatar={userData.profile_image}
          />

        </div>

      </div>

      {isColorModalOpen && <BannerColorModal setIsColorModalOpen={setIsColorModalOpen} bannerColor={bannerColor} setBannerColor={setBannerColor} bannerPresets={BANNER_PRESETS} />}
      {isAvatarModalOpen && <AvatarModal setIsAvatarModalOpen={setIsAvatarModalOpen} avatarPresets={avatarPresets} avatarImage={avatarImage} setAvatarImage={setAvatarImage} handleUpdateAvatar={handleUpdateAvatar} />}
      {isStoryOpen && <StoryModal setIsStoryOpen={setIsStoryOpen} stories={stories} currentStoryIndex={currentStoryIndex} fileInputRef={fileInputRef} handleDeleteStory={handleDeleteStory} handleStoryNavigation={handleStoryNavigation} handleFileChange={handleFileChange} storyProgress={storyProgress} handlePointerDown={handlePointerDown} handlePointerUp={handlePointerUp} setIsPaused={setIsPaused} handleAddStoryClick={handleAddStoryClick} />}
    </div>
  );
};

export default Profile;