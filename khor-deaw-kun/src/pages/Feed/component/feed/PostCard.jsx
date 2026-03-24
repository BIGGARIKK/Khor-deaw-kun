import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { TbDots, TbEdit, TbTrash, TbMessageCircle, TbSend, TbX, TbBeer } from "react-icons/tb";
import { apiRequest } from '../../../../service/api'; // 🌟 อย่าลืมเช็ค Path ให้ตรงด้วยนะครับ
import './PostCard.css';

// 🌟 สังเกตว่าผมเพิ่ม postId มารับค่าด้วย เพื่อเอาไว้ยิง API
function PostCard({ postId, author, image_author, time, text, hasImage, imageUrl, likes, comments }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [inputText, setInputText] = useState("");
    
    // 🌟 เปลี่ยนมารับ Array ของคอมเมนต์จริงๆ จาก Database
    const [commentLists, setCommentList] = useState(Array.isArray(comments) ? comments : []);

    // 🌟 1. ระบบเช็ครูปโปรไฟล์สุดฉลาด (รองรับทั้งไฟล์ .png และ Cloudinary)
    const avatarUrl = image_author?.startsWith("http") 
        ? image_author 
        : `/src/assets/avatars/${image_author || '1.png'}`;

    const postImageUrl = imageUrl?.startsWith("http") || imageUrl?.startsWith("data:") 
        ? imageUrl 
        : `/src/assets/avatars/${imageUrl}`;

    // 🌟 2. ฟังก์ชันคอมเมนต์ที่ต่อ Database จริง
    const handleAddComment = async () => {
        if (inputText.trim() === "") return;

        try {
            // ยิง API ไปบอก Flask ให้เก็บคอมเมนต์ (คุณต้องไปเขียน API /posts/<id>/comment รองรับด้วยนะ)
            const response = await apiRequest(`/posts/${postId}/comment`, 'POST', { text: inputText });
            
            // ถ้าสำเร็จ ก็เอาคอมเมนต์ใหม่มาโชว์ใน React ต่อท้ายของเดิมเลย
            if (response.comment) {
                setCommentList([...commentLists, response.comment]);
                setInputText(""); // เคลียร์ช่องพิมพ์
            }
        } catch (error) {
            console.error("Comment failed:", error);
            alert("คอมเมนต์ไม่ไป ลองใหม่อีกครั้งนะ 😅");
        }
    };

    return (
        <div className="wooden-box post-card-container">
            <div className="post-header">
                <div className="user-info-group">
                    {/* 🌟 ใช้ avatarUrl ที่เราเขียนดักไว้ */}
                    <div className="post-avatar"><img src={avatarUrl} alt="Profile" /></div>
                    <div className="user-meta">
                        <strong className="post-username">{author}</strong>
                        <span className="post-time">{time}</span>
                    </div>
                </div>
                <div className="menu-container">
                    <div className="menu-trigger" onClick={() => setIsMenuOpen(!isMenuOpen)}><TbDots size={24} /></div>
                    {isMenuOpen && (
                        <div className="post-dropdown-menu">
                            <div className="dropdown-item"><TbEdit size={18} /> Edit</div>
                            <div className="dropdown-item delete"><TbTrash size={18} /> Delete</div>
                        </div>
                    )}
                </div>
            </div>

            <div className="post-content-area">
                <p className="post-text">{text}</p>
                {hasImage && imageUrl && (
                    <div className="post-image-wrapper" onClick={() => setIsModalOpen(true)}>
                        <img src={postImageUrl} alt="Content" className="post-image-content" />
                    </div>
                )}
            </div>

            <div className="post-footer-new">
                <div className="footer-left-group">
                    {/* ปุ่มไลก์เดี๋ยวเราค่อยมาต่อ API คราวหลัง ตอนนี้ให้มันเปลี่ยนสีไปก่อน */}
                    <button className={`action-btn cheers-btn ${isLiked ? 'active' : ''}`} onClick={() => setIsLiked(!isLiked)}>
                        <span className="icon-wrap">{isLiked ? '🍻' : <TbBeer size={22} />}</span>
                        <span className="count">{isLiked ? likes + 1 : likes}</span>
                    </button>
                    <button className="action-btn comment-btn" onClick={() => setShowComments(!showComments)}>
                        <span className="icon-wrap"><TbMessageCircle size={22} /></span>
                        <span className="count">{commentLists.length}</span>
                    </button>
                </div>
                <button className="action-btn share-btn"><TbSend size={22} /></button>
            </div>

            {showComments && (
                <div className="comments-section-wood">
                    <div className="comments-list">
                        {commentLists.length === 0 ? (
                            <div style={{textAlign: 'center', opacity: 0.6, fontSize: '0.9rem', padding: '10px 0'}}>ยังไม่มีคอมเมนต์ เปิดตี้เลย! 🍻</div>
                        ) : (
                            commentLists.map((c) => (
                                <div key={c.comment_id || Math.random()} className="comment-bubble">
                                    <strong>{c.author}:</strong> {c.text}
                                </div>
                            ))
                        )}
                    </div>
                    <div className="comment-input-wrap">
                        <input type="text" className="comment-input" placeholder="แซวเพื่อนหน่อย..." value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddComment()} />
                        <button className="send-comment-btn" onClick={handleAddComment}><TbSend size={20} /></button>
                    </div>
                </div>
            )}

            {isModalOpen && createPortal(
                <div className="image-modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}><TbX size={30} /></button>
                        <img src={postImageUrl} alt="Zoom" className="modal-image" />
                    </div>
                </div>, document.body
            )}
        </div>
    );
}

export default PostCard;