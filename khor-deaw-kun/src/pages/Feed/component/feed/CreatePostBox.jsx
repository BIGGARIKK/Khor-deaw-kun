import React, { useState, useRef } from 'react';
import { TbPhoto, TbMoodSmile, TbSend, TbX } from "react-icons/tb";
import './CreatePostBox.css';

function CreatePostBox({ onPost }) {
    const [text, setText] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    const handleImageChange = (e) => {
        if (e.target.files[0]) setImagePreview(URL.createObjectURL(e.target.files[0]));
    };

    const handleRemoveImage = () => {
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handlePost = () => {
        if (text.trim() || imagePreview) {
            onPost(text, imagePreview);
            setText('');
            handleRemoveImage();
        }
    };

    // 🌟 ฟังก์ชันพิมพ์ข้อความด่วนเวลาคลิกเครื่องมือ
    const insertText = (str) => setText((prev) => prev + " " + str);

    return (
        <div className="wooden-box create-post-premium">
            <div className="create-post-top">
                <div className="author-avatar-large">🥥</div>
                <textarea 
                    className="premium-textarea" placeholder="คืนนี้ชิลล์ไหนดี? ส่งเสียงหน่อย! 🍻🌊" 
                    value={text} onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlePost(); } }}
                />
            </div>

            {imagePreview && (
                <div className="polaroid-preview-wrapper">
                    <div className="polaroid-card">
                        <img src={imagePreview} alt="Preview" className="polaroid-img" />
                        <button className="polaroid-remove-btn" onClick={handleRemoveImage}><TbX size={20} strokeWidth={3} /></button>
                    </div>
                </div>
            )}
            
            <div className="premium-actions-row">
                <div className="premium-tools">
                    <input type="file" accept="image/*" style={{ display: 'none' }} ref={fileInputRef} onChange={handleImageChange} />
                    <div className="tool-btn" title="Add Photo" onClick={() => fileInputRef.current.click()}><TbPhoto size={24} /></div>
                    {/* 🌟 กดแล้วเพิ่มข้อความแท็กโต๊ะ */}
                    <div className="tool-btn" title="Check In Table" onClick={() => insertText('[📍 โต๊ะ 1001]')}>
                        <span style={{ fontSize: '1.2rem' }}>📍</span>
                    </div>
                    {/* 🌟 กดแล้วเพิ่มอิโมจิเบียร์ */}
                    <div className="tool-btn" title="Feeling" onClick={() => insertText('🍻')}>
                        <TbMoodSmile size={24} />
                    </div>
                </div>
                <button className="shout-btn" onClick={handlePost}><TbSend size={20} /> Shout!</button>
            </div>
        </div>
    );
}

export default CreatePostBox;