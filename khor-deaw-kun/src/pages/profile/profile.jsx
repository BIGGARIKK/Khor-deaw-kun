import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiRequest } from '../../service/api';
import PostCard from '../Feed/component/feed/PostCard';
import './profile.css';

import LeftPanel from './component/LeftPanel';
import ProfileHeader from './component/ProfileHeader';
import RightPanel from './component/RightPanel'; // 🌟 เรียกใช้ Widget ใหม่
import AvatarModal from './component/AvatarModal';
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

// ฟังก์ชันแปลงเวลา
const formatDate = (dateInput) => {
  if (!dateInput) return 'ไม่ทราบเวลา';
  let date;
  if (typeof dateInput === 'object' && dateInput.$date) {
    date = new Date(dateInput.$date);
  } else {
    let safeString = dateInput.toString();
    if (safeString.includes(' ') && !safeString.includes('T')) {
        safeString = safeString.replace(' ', 'T');
    }
    date = new Date(safeString);
  }
  if (isNaN(date.getTime())) return 'ไม่นานมานี้';
  return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
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
  const { username } = useParams();

  const [userData, setUserData] = useState(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [bannerColor, setBannerColor] = useState(BANNER_PRESETS[0]);
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [userPosts, setUserPosts] = useState([]);

  const myLoggedInUsername = localStorage.getItem('username');
  const targetUser = username || myLoggedInUsername;
  const checkIsOwnProfile = targetUser === myLoggedInUsername;

  const avatarPresets = [myAv1, myAv2, myAv3, myAv4, myAv5, myAv6, myAv7, myAv8, myAv9];
  const [avatarImage, setAvatarImage] = useState(avatarPresets[0]);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  useEffect(() => {
    if (!targetUser) return;
    const loadProfileAndPosts = async () => {
      try {
        const profileData = await apiRequest(`/profile/${targetUser}`, 'GET');
        setUserData(profileData);
        if (profileData?.banner) setBannerColor(profileData.banner);
        
        if (profileData?.profile_image) {
          const match = profileData.profile_image.match(/\d+/);
          if (match) {
            const index = parseInt(match[0], 10) - 1;
            if (index >= 0 && index < avatarPresets.length) setAvatarImage(avatarPresets[index]);
          }
        }

        const userPostsData = await apiRequest(`/posts/${targetUser}`, 'GET');
        if (userPostsData) {
            const sortedPosts = [...userPostsData].sort((a, b) => 
                new Date(b.create_at?.$date || b.create_at) - new Date(a.create_at?.$date || a.create_at)
            );
            setUserPosts(sortedPosts);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    loadProfileAndPosts();
  }, [targetUser]);

  const handleUpdateAvatar = async (selectedAvatar) => {
    setAvatarImage(selectedAvatar);
    try {
      const avatarIndex = avatarPresets.indexOf(selectedAvatar);
      const fileName = avatarIndex !== -1 ? `${avatarIndex + 1}.png` : '1.png';
      await apiRequest('/profile', 'PUT', { profile_image: fileName });
    } catch (error) {
      console.error("Failed to update avatar:", error);
    }
  };

  const handleBannerChange = async (newColor) => {
    setBannerColor(newColor);
    try {
      await apiRequest('/profile', 'PUT', { banner: newColor }); 
    } catch (error) {
      console.error("บันทึกสีไม่สำเร็จ:", error);
    }
  };

  if (!userData) return <div className="profile-page"><div className="doodle-box loading-box">Loading Profile... ⏳</div></div>;

  return (
    <div className="profile-page">
      <div className="profile-container">
        
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

          <div className="unified-feed-section" style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
            {userPosts.length > 0 ? (
              userPosts.map((post) => (
                <PostCard
                  key={post._id}
                  postId={post._id}
                  author={post.author_username}
                  image_author={post.author_image || userData?.profile_image}
                  time={formatDate(post.create_at)}
                  text={post.text}
                  hasImage={!!post.image_url}
                  imageUrl={post.image_url}
                  likes={post.likes || []}
                  comments={post.comment || []}
                  currentUser={myLoggedInUsername}
                  onPostDeleted={(deletedId) => setUserPosts(prev => prev.filter(p => p._id !== deletedId))}
                />
              ))
            ) : (
              <div className="wooden-box" style={{ textAlign: 'center', padding: '40px', color: '#5C4033' }}>
                <h3>ยังไม่มีโพสต์เลย 🍻</h3>
              </div>
            )}
          </div>
        </div>

        {/* ✨ คอลัมน์ขวา (เพิ่ม Widget ให้ดูไม่โล่ง) */}
        <div className="right-panel-wrapper">
           <RightPanel userPosts={userPosts} userData={userData} />
        </div>

      </div>

      {isColorModalOpen && <BannerColorModal setIsColorModalOpen={setIsColorModalOpen} bannerColor={bannerColor} setBannerColor={handleBannerChange} bannerPresets={BANNER_PRESETS} />}
      {isAvatarModalOpen && <AvatarModal setIsAvatarModalOpen={setIsAvatarModalOpen} avatarPresets={avatarPresets} avatarImage={avatarImage} setAvatarImage={setAvatarImage} handleUpdateAvatar={handleUpdateAvatar} />}
    </div>
  );
};

export default Profile;