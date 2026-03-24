import React, { useState } from 'react';
import './feed.css';
import Sidebar from './component/feed/Sidebar';
import RightSidebar from './component/feed/RightSidebar';
import BottomBar from './component/feed/BottomBar';
import CreatePostBox from './component/feed/CreatePostBox';
import PostCard from './component/feed/PostCard';

function Feed() {
    const [posts, setPosts] = useState([
        {
            id: 1, author: "Beach_Bum_99", time: "2 HOURS AGO",
            text: "บรรยากาศดีมาก คลื่นลมเย็นสบาย ใครอยู่แถวหาดทรายขาวบ้าง มาชนแก้วกันหน่อย! 🍻🌊",
            hasImage: true, imageUrl: "https://images.unsplash.com/photo-1541225547634-1188fb986161?q=80&w=600&auto=format&fit=crop", 
            likes: 124, comments: 18
        },
        {   
            id: 2, author: "Night_Owl", time: "5 HOURS AGO",
            text: "เพิ่งเลิกงาน เหนื่อยมากกกก ต้องการเบียร์เย็นๆ ด่วน มีร้านไหนเปิดเพลงชิลล์ๆ แนะนำบ้างครับ?",
            hasImage: false, likes: 56, comments: 4
        }
    ]);

    const handleAddPost = (newText, newImage) => {
        const newPost = {
            id: Date.now(), author: "Coconuto_Kun", time: "JUST NOW",
            text: newText, hasImage: !!newImage, imageUrl: newImage,   
            likes: 0, comments: 0
        };
        setPosts([newPost, ...posts]);
    };

    return (
        <div className="app-container">
            <div className="top-header">
                <h1 className="logo-neon">Khor Deaw Kun</h1>
            </div>

            <div className="main-content-wrapper">
                <Sidebar />
                <div className="feed-content">
                    <CreatePostBox onPost={handleAddPost} />
                    <div className="post-list-container">
                        {posts.map((post) => (
                            <PostCard key={post.id} {...post} />
                        ))}
                    </div>
                </div>
                <RightSidebar />
            </div>
            <BottomBar />
        </div>
    );
}

export default Feed;