import React, { useState, useEffect } from 'react'; 
import './feed.css';
import Sidebar from './component/feed/Sidebar';
import RightSidebar from './component/feed/RightSidebar';
import BottomBar from './component/feed/BottomBar';
import CreatePostBox from './component/feed/CreatePostBox';
import PostCard from './component/feed/PostCard';

// 🌟 import apiRequest
import { apiRequest } from '../../service/api'; 
    
const getTimeAgo = (dateString) => {
    if (!dateString) return "UNKNOWN TIME";

    let date;
    if (typeof dateString === 'object' && dateString.$date) {
        date = new Date(dateString.$date);
    } else {
        date = new Date(dateString);
        if (isNaN(date.getTime()) && typeof dateString === 'string') {
            date = new Date(dateString.replace(' ', 'T')); 
        }
    }

    if (isNaN(date.getTime())) return "INVALID TIME";

    const now = new Date();
    let seconds = Math.floor((now - date) / 1000);

    if (seconds < -60) {
        seconds = Math.abs(seconds); 
    }

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
    const myUsername = localStorage.getItem('username');

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

    // 🌟 ฟังก์ชันจัดการเมื่อโพสต์ถูกลบ (ทำให้โพสต์หายไปจากจอทันที)
    const handlePostDeleted = (deletedId) => {
        setPosts((prevPosts) => prevPosts.filter((post) => post._id !== deletedId));
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
                                // 🌟 ปรับปรุงการส่งค่าเข้าไปใน PostCard
                                const formattedPost = {
                                    postId: post._id, 
                                    author: post.author_username,
                                    image_author: post.author_image,
                                    time: getTimeAgo(post.create_at),
                                    text: post.text,
                                    hasImage: !!post.image_url,
                                    imageUrl: post.image_url,
                                    likes: post.likes || [], 
                                    comments: post.comment || [], 
                                    currentUser: myUsername 
                                };

                                return (
                                    <PostCard 
                                        key={post._id} 
                                        {...formattedPost} 
                                        onPostDeleted={handlePostDeleted} // 🌟 ส่งฟังก์ชันลบไปให้ PostCard
                                    />
                                );
                            })
                        )}
                    </div>

                </div>
                <div className="right-sidebar-desktop">
                     <RightSidebar />
                </div>
            </div>
            <BottomBar />
        </div>
    );
}

export default Feed;