import React, { useState } from 'react';
import './feed.css';
import Sidebar from './component/feed/Sidebar';
import RightSidebar from './component/feed/RightSidebar';
import CreatePostBox from './component/feed/CreatePostBox';
import PostCard from './component/feed/PostCard';
import bgImage from '../../assets/bg.png';


function Feed() {
    const [posts, setPosts] = useState([
        {
            id: 1,
            author: "sketchy_artist",
            time: "2 HOURS AGO",
            text: "Just finished this quick doodle of the city skyline. Loving the minimalist B&W look! #doodle #sketch",
            hasImage: true,
            likes: 124,
            comments: 18
        },
        {   
            id: 2,
            author: "pen_and_ink",
            time: "5 HOURS AGO",
            text: "Sometimes the simplest lines carry the most emotion. What do you think of this abstract study?",
            hasImage: false,
            likes: 56,
            comments: 4
        }
    ]);

    // 🌟 สร้างฟังก์ชันสำหรับเพิ่มโพสต์ใหม่
    const handleAddPost = (newText, newImage) => {
            const newPost = {
                id: Date.now(),
                author: "Doodle_King", // เปลี่ยนเป็นชื่อคุณได้เลย
                time: "JUST NOW",
                text: newText,
                hasImage: !!newImage, // ถ้ามีรูปให้เป็น true
                imageUrl: newImage,   // 🌟 เก็บ URL รูปภาพไว้ใช้ใน PostCard
                likes: 0,
                comments: 0
            };
            
            setPosts([newPost, ...posts]);
        };

    return (
        <div
            style={{
                backgroundImage: `url(${bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                minHeight: '100vh',
                width: '100vw',   
            }}
        >
            <div className="app-container">
                <Sidebar />

                <div className="feed-content">
                    <h1 className="feed-title">Community Feed</h1>

                    {/* 🌟 ส่งฟังก์ชัน handleAddPost ผ่าน prop ที่ชื่อว่า onPost */}
                    <CreatePostBox onPost={handleAddPost} />

                    {posts.map((post) => (
                    <PostCard 
                        key={post.id}
                        author={post.author}
                        time={post.time}
                        text={post.text}
                        hasImage={post.hasImage}
                        imageUrl={post.imageUrl} /* 🌟 ส่ง URL รูปไปให้ PostCard */
                        likes={post.likes}
                        comments={post.comments}
                    />
                ))}
                </div>
                
                <RightSidebar />
            </div>
        </div>
    );
}

export default Feed;