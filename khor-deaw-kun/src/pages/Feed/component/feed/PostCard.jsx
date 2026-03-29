import React, { useState, useEffect } from 'react'; 
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom'; // 🌟 1. นำเข้าคำสั่งสำหรับเปลี่ยนหน้า
import { TbDots, TbEdit, TbTrash, TbMessageCircle, TbSend, TbX } from "react-icons/tb";
import { apiRequest } from '../../../../service/api';
import './PostCard.css';
import { IoBeerOutline, IoBeer } from "react-icons/io5";

function PostCard({ postId, author, image_author, time, text, hasImage, imageUrl, likes, comments, currentUser, onPostDeleted }) {
    const navigate = useNavigate(); // 🌟 2. เรียกใช้ฟังก์ชัน navigate

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
    const [editImage, setEditImage] = useState(imageUrl || null); 
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    useEffect(() => {
        setCommentList(Array.isArray(comments) ? comments : []);
    }, [comments]);

    // 🌟 3. อัปเดต Likes เมื่อ Database ส่งมา
    useEffect(() => {
        const likesArray = Array.isArray(likes) ? likes : [];
        setLikesCount(likesArray.length);

        const isUserLiked = likesArray.some(
            (likeName) => likeName.trim().toLowerCase() === currentUser?.trim().toLowerCase()
        );
        setIsLiked(isUserLiked); 
        

    }, [likes, currentUser]);

    // --- ฟังก์ชันลบโพสต์ ---
    const handleDeleteClick = () => {
        setIsDeleteModalOpen(true);
        setIsMenuOpen(false); 
    };

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

    // 🌟 ฟังก์ชันจัดการเมื่อเลือกรูปภาพใหม่
    const handleEditImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditImage(reader.result); 
            };
            reader.readAsDataURL(file);
        }
    };

    // 🌟 ฟังก์ชันบันทึกการแก้ไข
    const handleSaveEdit = async () => {
        if (editText.trim() === "" && !editImage) {
            alert("ต้องมีข้อความหรือรูปภาพอย่างน้อย 1 อย่างนะ!");
            return;
        }
        try {
            const response = await apiRequest(`/posts/${postId}`, 'PUT', { 
                text: editText,
                image_url: editImage 
            });
            if (response.message.includes("เรียบร้อย")) {
                setIsEditing(false);
                window.location.reload(); 
            }
        } catch (error) {
            alert("แก้ไขไม่สำเร็จ ลองอีกทีนะ");
        }
    };

    const avatarUrl = image_author?.startsWith("http") ? image_author : `/avatars/${image_author || '1.png'}`;
    const postImageUrl = imageUrl?.startsWith("http") || imageUrl?.startsWith("data:") ? imageUrl : `/avatars/${imageUrl}`;

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
                
                {/* 🌟 3. เติม onClick และ className ให้ตรงจุดนี้ (กดเพื่อไปหน้าโปรไฟล์) */}
                <div className="user-info-group clickable-profile" onClick={() => navigate(`/profile/${author}`)}>
                    <div className="post-avatar"><img src={avatarUrl} alt="Profile" /></div>
                    <div className="user-meta">
                        <strong className="post-username hover-name">{author}</strong>
                        <span className="post-time">{time}</span>
                    </div>
                </div>

                {author?.trim().toLowerCase() === currentUser?.trim().toLowerCase() && (
                    <div className="menu-container">
                        <div className="menu-trigger" onClick={() => setIsMenuOpen(!isMenuOpen)}><TbDots size={24} /></div>
                        {isMenuOpen && (
                            <div className="post-dropdown-menu">
                                <div className="dropdown-item" onClick={() => { 
                                    setIsEditing(true); 
                                    setIsMenuOpen(false);
                                    setEditText(text);
                                    setEditImage(imageUrl || null);
                                }}>
                                    <TbEdit size={18} /> Edit
                                </div>
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
                    <button className={`action-btn ${isLiked ? 'active' : ''}`} onClick={handleLike}>
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
                {/* <button className="action-btn share-btn"><TbSend size={22} /></button> */}
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

            {/* 🌟 Popup สำหรับแก้ไขข้อความและรูปภาพ */}
            {isEditing && createPortal(
                <div className="edit-modal-overlay" onClick={() => setIsEditing(false)}>
                    <div className="edit-modal-content wooden-box" onClick={(e) => e.stopPropagation()}>
                        <div className="edit-modal-header">
                            <h3 style={{ margin: 0, color: '#5d3a1a' }}>📝 แก้ไขแคปชั่นและรูป</h3>
                            <button className="modal-close-btn" onClick={() => setIsEditing(false)}><TbX size={24} /></button>
                        </div>
                        <textarea 
                            className="edit-textarea"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                        />

                        {/* 🌟 ส่วนแสดงและแก้ไขรูปภาพ */}
                        {editImage ? (
                            <div className="edit-image-preview">
                                <img src={editImage.startsWith("http") || editImage.startsWith("data:") ? editImage : `/avatars/${editImage}`} alt="Preview" />
                                <button className="remove-image-btn" onClick={() => setEditImage(null)} title="ลบรูปภาพ">
                                    <TbX size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="edit-image-upload">
                                <label htmlFor={`edit-image-upload-${postId}`} className="upload-image-label">
                                    📸 เพิ่มรูปภาพ
                                </label>
                                <input 
                                    id={`edit-image-upload-${postId}`}
                                    type="file" 
                                    accept="image/*" 
                                    style={{ display: 'none' }} 
                                    onChange={handleEditImageChange}
                                />
                            </div>
                        )}

                        <div className="edit-modal-actions">
                            <button className="btn-cancel" onClick={() => setIsEditing(false)}>ยกเลิก</button>
                            <button className="btn-save" onClick={handleSaveEdit}>บันทึก</button>
                        </div>
                    </div>
                </div>, 
                document.body
            )}

            {/* Popup ยืนยันการลบ */}
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
                            <button className="btn-danger" onClick={confirmDelete}>ลบเลย!</button>
                        </div>
                    </div>
                </div>,
                document.body
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