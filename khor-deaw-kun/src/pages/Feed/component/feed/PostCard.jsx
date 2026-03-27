import React, { useState, useEffect } from 'react'; 
import { createPortal } from 'react-dom';
import { TbDots, TbEdit, TbTrash, TbMessageCircle, TbSend, TbX, TbBeer } from "react-icons/tb";
import { apiRequest } from '../../../../service/api';
import './PostCard.css';
import { IoBeerOutline, IoBeer } from "react-icons/io5";

function PostCard({ postId, author, image_author, time, text, hasImage, imageUrl, likes, comments, currentUser }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [inputText, setInputText] = useState("");

    // 🌟 1. ตั้ง State พื้นฐานไว้ก่อน
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [commentLists, setCommentList] = useState([]);

    // 🌟 2. อัปเดต Comments เมื่อ Database ส่งมา
    useEffect(() => {
        setCommentList(Array.isArray(comments) ? comments : []);
    }, [comments]);

    // 🌟 3. อัปเดต Likes เมื่อ Database ส่งมา (นี่คือพระเอกที่หายไป!)
    // 🌟 3. อัปเดต Likes เมื่อ Database ส่งมา
    useEffect(() => {
        const likesArray = Array.isArray(likes) ? likes : [];
        setLikesCount(likesArray.length);

        // 🌟 แก้ไข: จัดการชื่อให้เป็นตัวพิมพ์เล็กเหมือนกันให้หมด เผื่อตอนพิมพ์ Log in กับตอนเซฟลง DB มันเป็นคนละแบบ
        const isUserLiked = likesArray.some(
            (likeName) => likeName.trim().toLowerCase() === currentUser?.trim().toLowerCase()
        );
        
        setIsLiked(isUserLiked); 
        
        // แอบเช็คดูใน Console (F12) ว่ามันเปรียบเทียบเจอไหม
        console.log("รายชื่อคนกดไลก์:", likesArray, "ชื่อเรา:", currentUser, "กดไปหรือยัง?", isUserLiked);

    }, [likes, currentUser]);


    const avatarUrl = image_author?.startsWith("http")
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
                    <button className={`action-btn cheers-btn ${isLiked ? 'active' : ''}`} onClick={handleLike}>
                        <span className="icon-wrap">{isLiked ? '🍻' : <TbBeer size={22} />}</span>
                        <span className="count">{likesCount}</span>
                    {/* ✨ เปลี่ยน onClick มาใช้ handleLikeClick ที่เราสร้างใหม่ */}
                    /*
                    <button className={`action-btn cheers-btn ${isLiked ? 'active' : ''}`} onClick={handleLikeClick}>
                        <span className="icon-wrap">
                           {isLiked ? <IoBeer size={22} color="#F48C2A" /> : <IoBeerOutline size={22} />}
                        </span>
                        <span className="count">{isLiked ? likes + 1 : likes}</span>
                    </button>*/
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