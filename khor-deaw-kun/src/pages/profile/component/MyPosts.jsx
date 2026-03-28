import React from 'react';
import PostCard from '../../Feed/component/feed/PostCard'; 
import './MyPosts.css';

// 🌟 ฟังก์ชันคำนวณเวลาว่า "ผ่านไปกี่นาที/ชั่วโมง/วัน"
const formatTimeAgo = (dateInput) => {
  if (!dateInput) return 'ไม่ทราบเวลา';

  let date;

  // 1. ดักจับกรณี MongoDB ส่งมาเป็น Object { $date: ... }
  if (typeof dateInput === 'object' && dateInput.$date) {
    date = new Date(dateInput.$date);
  } else {
    // 2. ดักจับกรณีเป็น String แต่มีช่องว่างแทนตัว T
    let safeString = dateInput.toString();
    if (safeString.includes(' ') && !safeString.includes('T')) {
        safeString = safeString.replace(' ', 'T');
    }
    date = new Date(safeString);
  }

  // 3. ถ้าแปลงแล้วยังพัง
  if (isNaN(date.getTime())) {
    return 'ไม่นานมานี้';
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  // 4. คำนวณช่วงเวลา
  if (diffInSeconds < 0 || diffInSeconds < 60) return 'เมื่อกี้';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} นาทีที่แล้ว`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ชั่วโมงที่แล้ว`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} วันที่แล้ว`;

  // ถ้าเกิน 30 วัน ให้โชว์เป็นวันที่แบบย่อแทน
  return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
};

const MyPosts = ({ textPosts, username, userAvatar }) => {
  // ถ้าไม่มีโพสต์ให้ return null (ไม่แสดงอะไร)
  if (!textPosts || textPosts.length === 0) return null;

  return (
    <div className="text-posts-feed">
      <h3 className="wooden-box text-feed-title">My Post 💭</h3>
      <div className="text-posts-scrollable">
        {textPosts.map(post => {
          
          return (
            <div className="text-post-item" key={post._id}>
              <PostCard
                postId={post._id}
                author={post.author_username}
                image_author={post.author_image || userAvatar}
                time={formatTimeAgo(post.create_at)} // 🌟 เรียกใช้ฟังก์ชันที่นี่เลย!
                text={post.text}
                hasImage={false}
                likes={post.likes || []}
                comments={post.comment || []} // ใน DB ชื่อคอมเมนต์ไม่มี s
                currentUser={username}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyPosts;