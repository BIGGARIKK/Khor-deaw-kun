import React, { useState } from 'react';
import './PostCard.css';
import { createPortal } from 'react-dom';
import { TbDots, TbEdit, TbTrash, TbHeart, TbMessageCircle, TbSend, TbX } from "react-icons/tb";

function PostCard({ author, time, text, hasImage, imageUrl, likes, comments }) {
    // State สำหรับเมนู 3 จุด
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    // State สำหรับเปิด/ปิดรูป Popup
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [showComments, setShowComments] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const [commentLists, setCommentList] = useState([
        { id: 1, author: "art_lover", text: "Wow, this is amazing! The details are incredible." },
        { id: 2, author: "doodle_fan", text: "I love the style! So unique and expressive." },
        { id: 3, author: "sketchy_artist", text: "Great work! What materials did you use?" }
    ]);
    const [inputText, setInputText] = useState("");

    const handleAddComment = () => {
        if (inputText.trim() === "") return; // ไม่เพิ่มถ้าข้อความว่าง

        const newComment = {
            id: Date.now(),
            author: "Doodle_King", // เปลี่ยนเป็นชื่อคุณได้เลย
            text: inputText
        }
        setCommentList([...commentLists, newComment]);
        setInputText("");
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleAddComment();
        }
    };


    return (
        <div className="doodle-box post-card-container">
            {/* --- ส่วนหัว (รูปโปรไฟล์, ชื่อ, เมนู) --- */}
            <div className="post-header">
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div className="post-avatar"></div>
                    <div>
                        <strong style={{ fontSize: '1.2rem' }}>{author}</strong>
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>{time}</div>
                    </div>
                </div>

                <div style={{ position: 'relative' }}>
                    <div className="menu-trigger" onClick={toggleMenu}>
                        <TbDots size={24} strokeWidth={2.5} />
                    </div>
                    {isMenuOpen && (
                        <div className="post-dropdown-menu">
                            <div className="dropdown-item"><TbEdit size={20} /> Edit</div>
                            <div className="dropdown-item delete"><TbTrash size={20} /> Delete</div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- ส่วนข้อความ --- */}
            <p className="post-text">{text}</p>

            {/* --- ส่วนรูปภาพ --- */}
            {hasImage && (
                imageUrl ? (
                    // 🌟 ใช้ Wrapper ครอบรูปภาพ (ถูกต้องแล้วครับ)
                    <div className="post-image-wrapper" onClick={() => setIsModalOpen(true)}>
                        <img
                            src={imageUrl}
                            alt="Post Content"
                            // 🌟 ใช้คลาสนี้เพื่อให้ตรงกับ CSS ที่แก้
                            className="post-image-content"
                        />
                    </div>
                ) : (
                    <div className="post-image-placeholder"></div>
                )
            )}

            {/* --- ส่วนปุ่มกดด้านล่าง --- */}
            <div className="post-footer">
                <div style={{ display: 'flex', gap: '20px' }}>
                    <div className="footer-actions"><TbHeart size={22} strokeWidth={2} /> {likes}</div>
                    <div className="footer-actions" onClick={() => setShowComments(!showComments)}>
                        <TbMessageCircle size={22} strokeWidth={2} /> {comments}
                    </div>
                </div>
                <div className="footer-actions"><TbSend size={22} strokeWidth={2} /></div>
            </div>

            {showComments && (
                <div className="comments-section">
                    
                    {/* 🌟 5. ดึงข้อมูลจาก State `commentsList` มาแสดงผล */}
                    <div className="comments-list">
                        {commentLists.map((c) => (
                            <div key={c.id} className="comment-item">
                                <strong>{c.author} : </strong> <span>{c.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* 🌟 6. ผูก State เข้ากับช่องพิมพ์ และปุ่มกด */}
                    <div className="comment-input-area">
                        <input 
                            type="text" 
                            placeholder="Add a comment..." 
                            className="comment-input" 
                            value={inputText} // ผูกค่ากับ State
                            onChange={(e) => setInputText(e.target.value)} // พิมพ์ปุ๊บ อัปเดต State ปั๊บ
                            onKeyDown={handleKeyDown} // ดักจับตอนกด Enter
                        />
                        <button className="comment-submit-btn" onClick={handleAddComment}>
                            <TbSend size={20} strokeWidth={2} />
                        </button>
                    </div>
                </div>
            )}

            {/* --- 🌟 ส่วน Popup รูปภาพใหญ่ (Modal) --- */}
            {isModalOpen && createPortal(
                <div className="image-modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                            <TbX size={30} strokeWidth={3} />
                        </button>
                        <img src={imageUrl} alt="Enlarged Post" className="modal-image" />
                    </div>
                </div>,
                document.body // 🌟 2. สั่งให้วาร์ปไปวาดที่ body ดื้อๆ เลย
            )}
        </div>
    );
}

export default PostCard;