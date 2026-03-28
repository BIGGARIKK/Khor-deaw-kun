import React, { useState, useEffect } from 'react'; 
import { createPortal } from 'react-dom';
import { TbDots, TbEdit, TbTrash, TbMessageCircle, TbSend, TbX, TbBeer } from "react-icons/tb";
import { apiRequest } from '../../../../service/api';
import './PostCard.css';
import { IoBeerOutline, IoBeer } from "react-icons/io5";

function PostCard({ postId, author, image_author, time, text, hasImage, imageUrl, likes, comments, currentUser, onPostDeleted }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [inputText, setInputText] = useState("");

    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [commentLists, setCommentList] = useState([]);

    // 🌟 State สำหรับ Popup แก้ไข
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(text);

    // 🌟 State ใหม่! สำหรับ Popup ยืนยันการลบ
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    useEffect(() => {
        setCommentList(Array.isArray(comments) ? comments : []);
    }, [comments]);

    useEffect(() => {
        const likesArray = Array.isArray(likes) ? likes : [];
        setLikesCount(likesArray.length);

        const isUserLiked = likesArray.some(
            (likeName) => likeName.trim().toLowerCase() === currentUser?.trim().toLowerCase()
        );
        setIsLiked(isUserLiked); 
    }, [likes, currentUser]);

    // --- 🌟 เปลี่ยนฟังก์ชันคลิกลบ ให้เปิด Popup แทน ---
    const handleDeleteClick = () => {
        setIsDeleteModalOpen(true);
        setIsMenuOpen(false); // ปิดเมนูสามจุด
    };

    // --- 🌟 ฟังก์ชันลบจริง (จะถูกเรียกตอนกดยืนยันใน Popup) ---
    const confirmDelete = async () => {
        try {
            const response = await apiRequest(`/posts/${postId}`, 'DELETE');
            if (response.message.includes("เรียบร้อย")) {
                setIsDeleteModalOpen(false);
                if (onPostDeleted) onPostDeleted(postId);
            }
        } catch (error) {
            alert("ลบไม่ได้ สงสัยอาถรรพ์หมูกระทะ ลองใหม่นะ!");
        }
    };

    // --- ฟังก์ชันบันทึกการแก้ไข ---
    const handleSaveEdit = async () => {
        if (editText.trim() === "" || editText === text) {
            setIsEditing(false);
            return;
        }
        try {
            const response = await apiRequest(`/posts/${postId}`, 'PUT', { text: editText });
            if (response.message.includes("เรียบร้อย")) {
                setIsEditing(false);
                window.location.reload(); 
            }
        } catch (error) {
            alert("แก้ไขไม่สำเร็จ ลองอีกทีนะ");
        }
    };

    const avatarUrl = image_author?.startsWith("http") ? image_author : `/src/assets/avatars/${image_author || '1.png'}`;
    const postImageUrl = imageUrl?.startsWith("http") || imageUrl?.startsWith("data:") ? imageUrl : `/src/assets/avatars/${imageUrl}`;

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
        }
    };

    const handleLike = async () => {
        setIsLiked(!isLiked);
        setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
        try {
            await apiRequest(`/posts/${postId}/like`, 'POST');
        } catch (error) {
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

                {author?.trim().toLowerCase() === currentUser?.trim().toLowerCase() && (
                    <div className="menu-container">
                        <div className="menu-trigger" onClick={() => setIsMenuOpen(!isMenuOpen)}><TbDots size={24} /></div>
                        {isMenuOpen && (
                            <div className="post-dropdown-menu">
                                <div className="dropdown-item" onClick={() => { setIsEditing(true); setIsMenuOpen(false); }}>
                                    <TbEdit size={18} /> Edit
                                </div>
                                {/* ✨ เปลี่ยน onClick มาเรียก handleDeleteClick */}
                                <div className="dropdown-item delete" onClick={handleDeleteClick}>
                                    <TbTrash size={18} /> Delete
                                </div>
                            </div>
                        )}
                    </div>
                )}
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
                        <span className="icon-wrap">
                           {isLiked ? <IoBeer size={22} color="#F48C2A" /> : <IoBeerOutline size={22} />}
                        </span>
                        <span className="count">{likesCount}</span>
                    </button>
                    <button className={`action-btn comment-btn ${showComments ? 'active' : ''}`} onClick={() => setShowComments(!showComments)}>
                        <span className="icon-wrap"><TbMessageCircle size={22} /></span>
                        <span className="count">{commentLists.length}</span>
                    </button>
                </div>
                <button className="action-btn share-btn"><TbSend size={22} /></button>
            </div>

            {/* ... ส่วนคอมเมนต์ ... */}
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

            {/* 🌟 Popup สำหรับแก้ไขข้อความ */}
            {isEditing && createPortal(
                <div className="edit-modal-overlay" onClick={() => { setIsEditing(false); setEditText(text); }}>
                    <div className="edit-modal-content wooden-box" onClick={(e) => e.stopPropagation()}>
                        <div className="edit-modal-header">
                            <h3 style={{ margin: 0, color: '#5d3a1a' }}>📝 แก้ไขแคปชั่น</h3>
                            <button className="modal-close-btn" onClick={() => { setIsEditing(false); setEditText(text); }}><TbX size={24} /></button>
                        </div>
                        <textarea 
                            className="edit-textarea"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            autoFocus
                        />
                        <div className="edit-modal-actions">
                            <button className="btn-cancel" onClick={() => { setIsEditing(false); setEditText(text); }}>ยกเลิก</button>
                            <button className="btn-save" onClick={handleSaveEdit}>บันทึก</button>
                        </div>
                    </div>
                </div>, 
                document.body
            )}

            {/* 🌟 Popup สำหรับ "ยืนยันการลบ" (หน้าตาเหมือนตอน Edit เป๊ะ แต่อยู่ตรงกลางและมีปุ่มแดง) */}
            {isDeleteModalOpen && createPortal(
                <div className="edit-modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
                    <div className="edit-modal-content wooden-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <div className="edit-modal-header" style={{ borderBottom: 'none' }}>
                            <h3 style={{ margin: 0, color: '#5d3a1a' }}>🗑️ ยืนยันการลบ</h3>
                            <button className="modal-close-btn" onClick={() => setIsDeleteModalOpen(false)}><TbX size={24} /></button>
                        </div>
                        <p style={{ fontSize: '1.2rem', color: '#4a2c11', textAlign: 'center', margin: '15px 0 25px 0' }}>
                            ตี้ยังไม่จบ จะลบโพสต์จริงหรอ? 🍻
                        </p>
                        <div className="edit-modal-actions" style={{ justifyContent: 'center' }}>
                            <button className="btn-cancel" onClick={() => setIsDeleteModalOpen(false)}>ยกเลิก</button>
                            {/* ✨ ปุ่มกดยืนยันสีแดง */}
                            <button className="btn-danger" onClick={confirmDelete}>ลบเลย!</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Modal ซูมรูป */}
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