import React from 'react';
import PostCard from '../../Feed/component/feed/PostCard'; 
import './MyPosts.css';

const MyPosts = ({ textPosts, username, userAvatar }) => {
  // ถ้าไม่มีโพสต์ให้ return null (ไม่แสดงอะไร)
  if (!textPosts || textPosts.length === 0) return null;

  return (
    <div className="text-posts-feed">
      <h3 className="wooden-box text-feed-title">My Post 💭</h3>
      <div className="text-posts-scrollable">
        {textPosts.map(post => {
          // แปลงวันที่ให้แสดงผลสวยงาม
          const date = new Date(post.create_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
          const time = new Date(post.create_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

          return (
            <div className="text-post-item" key={post._id}>
              <PostCard
                postId={post._id}
                author={post.author_username}
                image_author={post.author_image || userAvatar}
                time={`${date} at ${time}`} 
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