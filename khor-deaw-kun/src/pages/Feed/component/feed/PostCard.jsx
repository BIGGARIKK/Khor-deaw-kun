import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { TbDots, TbEdit, TbTrash, TbMessageCircle, TbSend, TbX, TbBeer } from "react-icons/tb";
import './PostCard.css';



function PostCard({ author, time, text, hasImage, imageUrl, likes, comments }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [inputText, setInputText] = useState("");
    const [commentLists, setCommentList] = useState([
        { id: 1, author: "Party_Animal", text: "น่าไปจัดดดด 🍻" }
    ]);

    const handleAddComment = () => {
        if (inputText.trim() === "") return;
        setCommentList([...commentLists, { id: Date.now(), author: "Coconuto_Kun", text: inputText }]);
        setInputText("");
    };

    return (
        <div className="wooden-box post-card-container">
            <div className="post-header">
                <div className="user-info-group">
                    <div className="post-avatar">🥥</div>
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
                        <img src={imageUrl} alt="Content" className="post-image-content" />
                    </div>
                )}
            </div>

            <div className="post-footer-new">
                <div className="footer-left-group">
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
                        {commentLists.map((c) => (
                            <div key={c.id} className="comment-bubble"><strong>{c.author}:</strong> {c.text}</div>
                        ))}
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
                        <img src={imageUrl} alt="Zoom" className="modal-image" />
                    </div>
                </div>, document.body
            )}
        </div>
    );
}

export default PostCard;