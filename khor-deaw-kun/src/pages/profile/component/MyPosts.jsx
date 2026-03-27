import React from 'react';
import PostCard from '../../Feed/component/feed/PostCard'; // เช็ก Path ให้ตรงกับโปรเจกต์คุณด้วยนะครับ
import './MyPosts.css';

const MyPosts = ({ textPosts, username }) => {
  // ถ้าไม่มีโพสต์ให้ return null (ไม่แสดงอะไร)
  if (!textPosts || textPosts.length === 0) return null;

  return (
    <div className="text-posts-feed">
      <h3 className="wooden-box text-feed-title">My Post 💭</h3>
      <div className="text-posts-scrollable">
        {textPosts.map(post => (
          <div className="text-post-item" key={post.id}>
            <PostCard
              author={username}
              time={post.time}
              text={post.text}
              hasImage={false}
              likes={post.likes}
              comments={post.comments}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyPosts;