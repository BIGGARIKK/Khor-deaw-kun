import React, { useState, useEffect } from 'react';
import './feed.css';
import Sidebar from './component/feed/Sidebar';
import RightSidebar from './component/feed/RightSidebar';
import BottomBar from './component/feed/BottomBar';
import CreatePostBox from './component/feed/CreatePostBox';
import PostCard from './component/feed/PostCard';

// 🌟 อย่าลืม import apiRequest
import { apiRequest } from '../../service/api'; 

// 🌟 ย้ายฟังก์ชันมาไว้ข้างนอก จะได้ไม่ถูกสร้างใหม่ทุกครั้งที่โหลดหน้าเว็บ
const getTimeAgo = (dateString) => {
    if (!dateString) return "JUST NOW";

    let date = new Date(dateString);
    if (isNaN(date.getTime()) && typeof dateString === 'string') {
        date = new Date(dateString.replace(' ', 'T') + 'Z'); 
    }

    if (isNaN(date.getTime())) return "UNKNOWN TIME";

    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return "JUST NOW"; 
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} MINS AGO`; 
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} HOURS AGO`; 
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} DAYS AGO`; 

    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

function Feed() {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPosts = async () => {
        try {
            setIsLoading(true);
            const data = await apiRequest('/posts', 'GET');
            setPosts(data); 
        } catch (error) {
            console.error("โหลดฟีดไม่สำเร็จ:", error);
        } finally {
            setIsLoading(false); 
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleAddPost = () => {
        fetchPosts(); 
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
                        {isLoading ? (
                            <div style={{ textAlign: 'center', marginTop: '40px', color: '#fff', fontSize: '1.2rem' }}>
                                กำลังโหลดเสียงคลื่น... 🌊⏳
                            </div>
                        ) : posts.length === 0 ? (
                            <div style={{ textAlign: 'center', marginTop: '40px', color: '#fff', fontSize: '1.2rem' }}>
                                ยังไม่มีใคร Shout เลย เริ่มเปิดตี้สิ! 🍻
                            </div>
                        ) : (
                            posts.map((post) => {
                                // 🌟 จุดที่แก้ไข: เพิ่ม postId และเปลี่ยน comments ให้เป็น Array
                                const formattedPost = {
                                    id: post._id,
                                    postId: post._id, // ✨ ต้องมีตัวนี้ส่งไปให้ PostCard ใช้ยิง API คอมเมนต์
                                    author: post.author_username,
                                    image_author: post.author_image,
                                    time: getTimeAgo(post.created_at),
                                    text: post.text,
                                    hasImage: !!post.image_url,
                                    imageUrl: post.image_url,
                                    likes: post.likes ? post.likes.length : 0,
                                    comments: post.comments || [] // ✨ ส่งไปทั้ง Array เลย ถ้าไม่มีให้เป็น Array ว่าง []
                                };

                                return <PostCard key={formattedPost.id} {...formattedPost} />;
                            })
                        )}
                    </div>

                </div>
                <RightSidebar />
            </div>
            <BottomBar />
        </div>
    );
}

export default Feed;