import React, { useState, useEffect } from 'react';
import './feed.css';
import Sidebar from './component/feed/Sidebar';
import RightSidebar from './component/feed/RightSidebar';
import BottomBar from './component/feed/BottomBar';
import CreatePostBox from './component/feed/CreatePostBox';
import PostCard from './component/feed/PostCard';

// 🌟 อย่าลืม import apiRequest
import { apiRequest } from '../../service/api'; 
    
    const getTimeAgo = (dateString) => {
        // 1. ถ้าไม่มีค่าส่งมา ให้ขึ้นคำว่า UNKNOWN แทน จะได้รู้ว่าบั๊กที่ Database ไม่ส่งมา
        if (!dateString) return "UNKNOWN TIME";

        // ลองแอบปริ้นท์ค่าดูใน Console (F12) ว่า Flask ส่งอะไรมากันแน่
        // console.log("เวลาจาก DB:", dateString); 

        let date;
        // 2. เช็คว่า Database ส่งมาเป็น Object {$date: ...} แบบ MongoDB หรือเปล่า
        if (typeof dateString === 'object' && dateString.$date) {
            date = new Date(dateString.$date);
        } else {
            date = new Date(dateString);
            // ดักเผื่อ Flask ส่งมาเป็น Text ทื่อๆ แบบไม่มี Timezone
            if (isNaN(date.getTime()) && typeof dateString === 'string') {
                // เปลี่ยนเว้นวรรคเป็น T แต่รอบนี้ "ไม่เติม Z" เพื่อให้มันยึดตามเวลา Local ของเครื่อง
                date = new Date(dateString.replace(' ', 'T')); 
            }
        }

        if (isNaN(date.getTime())) return "INVALID TIME";

        const now = new Date();
        // 3. คำนวณความต่าง (Math.abs ช่วยกันเหนียวเผื่อเวลาติดลบจาก Timezone)
        let seconds = Math.floor((now - date) / 1000);

        // ถ้าเวลาเป็นอนาคต (ติดลบ) เกิน 1 นาที แปลว่า Timezone ตีกันแน่ๆ ให้บังคับแก้ชั่วคราว
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
                                // 🌟 จุดที่แก้ไข: ปรับการส่ง likes และเพิ่ม currentUser
                                const formattedPost = {
                                    id: post._id,
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