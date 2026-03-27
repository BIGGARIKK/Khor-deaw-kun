import React, { useState, useEffect } from 'react'; 
import { createPortal } from 'react-dom';
import { TbDots, TbEdit, TbTrash, TbMessageCircle, TbSend, TbX } from "react-icons/tb";
import { apiRequest } from '../../../../service/api'; 
import './PostCard.css';
import { IoBeerOutline, IoBeer } from "react-icons/io5";

// ✨ 1. เพิ่ม isLikedParent และ onLikeToggle มารับค่าความจำจากหน้าหลัก
function PostCard({ postId, author, image_author, time, text, hasImage, imageUrl, likes, comments, isLikedParent, onLikeToggle }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [inputText, setInputText] = useState("");
    
    // ✨ 2. ระบบจัดการ Like: ถ้าหน้าแม่ส่งค่ามาให้ใช้ของแม่ (จะจำค่าได้) ถ้าไม่มีก็ใช้ของตัวเอง
    const [localIsLiked, setLocalIsLiked] = useState(false);
    const isLiked = isLikedParent !== undefined ? isLikedParent : localIsLiked;

    const handleLikeClick = () => {
        if (onLikeToggle) {
            onLikeToggle(); // ถ้าหน้าแม่จัดการ ให้เรียกใช้ฟังก์ชันของแม่
        } else {
            setLocalIsLiked(!localIsLiked); // ถ้าไม่มีหน้าแม่ (เช่นใน MyPosts) ให้จัดการตัวเอง
        }
    };

    const [commentLists, setCommentList] = useState(Array.isArray(comments) ? comments : []);

    // ✨ 3. แก้บั๊กรูประบบโปรไฟล์พัง (รองรับไฟล์ import, base64, url และไฟล์ local)
    const avatarUrl = image_author?.includes("/") || image_author?.startsWith("data:") || image_author?.startsWith("http")
        ? image_author 
        : `/src/assets/avatars/${image_author || '1.png'}`;

    const postImageUrl = imageUrl?.startsWith("http") || imageUrl?.startsWith("data:")
        ? imageUrl
        : `/src/assets/avatars/${imageUrl}`;

    const handleAddComment = async () => {
        if (inputText.trim() === "") return;
        try {
            const response = await apiRequest(`/posts/${postId}/comment`, 'POST', { text: inputText });
            if (response.comment) {
                setCommentList([...commentLists, response.comment]);
                setInputText("");
                setInputText("");
            }
        } catch (error) {
            console.error("Comment failed:", error);
            alert("คอมเมนต์ไม่ไป ลองใหม่อีกครั้งนะ 😅");
        }
    };

    // 🌟 ฟังก์ชันชนแก้ว (กดไลก์)
    const handleLike = async () => {
        // สลับสีและบวก/ลบเลขทันที ให้ผู้ใช้รู้สึกว่าแตะปุ๊บติดปั๊บ
        setIsLiked(!isLiked);
        setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
        
        try {
            await apiRequest(`/posts/${postId}/like`, 'POST');
        } catch (error) {
            // ถ้า Database มีปัญหา ค่อยเด้งกลับมาค่าเดิม
            setIsLiked(!isLiked);
            setLikesCount(isLiked ? likesCount + 1 : likesCount - 1);
        }
    };

    return (
        <div className="wooden-box post-card-container">
            <div className="post-header">
                <div className="user-info-group">
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
                    {/* ✨ เปลี่ยน onClick มาใช้ handleLikeClick ที่เราสร้างใหม่ */}
                    <button className={`action-btn cheers-btn ${isLiked ? 'active' : ''}`} onClick={handleLikeClick}>
                        <span className="icon-wrap">
                           {isLiked ? <IoBeer size={22} color="#F48C2A" /> : <IoBeerOutline size={22} />}
                        </span>
                        <span className="count">{isLiked ? likes + 1 : likes}</span>
                    </button>
                    <button className={`action-btn comment-btn ${showComments ? 'active' : ''}`} onClick={() => setShowComments(!showComments)}>
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
                            <div style={{ textAlign: 'center', opacity: 0.6, fontSize: '0.9rem', padding: '10px 0' }}>ยังไม่มีคอมเมนต์ เปิดตี้เลย! 🍻</div>
                        ) : (
                            commentLists.map((c, index) => (
                                <div key={c.comment_id || index} className="comment-bubble">
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