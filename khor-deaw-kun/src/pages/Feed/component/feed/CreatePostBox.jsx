import React, { useState, useRef } from 'react';
import './CreatePostBox.css';
import { TbPhoto, TbPencil, TbMoodSmile, TbX } from "react-icons/tb"; // 🌟 เพิ่ม TbX สำหรับปุ่มลบรูป

function CreatePostBox({ onPost }) {
    const [text, setText] = useState('');
    const [imagePreview, setImagePreview] = useState(null); // 🌟 State เก็บรูปพรีวิว
    const fileInputRef = useRef(null); // 🌟 ตัวอ้างอิงไปหา input file ที่ซ่อนอยู่

    // 🌟 ฟังก์ชันเมื่อมีการเลือกไฟล์รูปภาพ
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // สร้าง URL ชั่วคราวเพื่อเอามาแสดงเป็นพรีวิว
            const imageUrl = URL.createObjectURL(file);
            setImagePreview(imageUrl);
        }
    };

    // 🌟 ฟังก์ชันลบรูปพรีวิวทิ้ง
    const handleRemoveImage = () => {
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // เคลียร์ค่าไฟล์ที่เลือกไว้
        }
    };

    const handlePost = () => {
        // เช็คว่ามีข้อความ หรือ มีรูปภาพ อย่างใดอย่างหนึ่งก็โพสต์ได้
        if (text.trim() || imagePreview) {
            onPost(text, imagePreview); // 🌟 ส่งทั้งข้อความและรูปลงไปให้ Feed
            setText('');
            handleRemoveImage(); // เคลียร์รูปหลังจากโพสต์เสร็จ
        }
    };

    return (
        <div className="doodle-box create-post-container">
            <input 
                className="create-post-input"
                type="text" 
                placeholder="What's on your sketchbook?" 
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePost()}
            />

            {/* 🌟 พื้นที่แสดงรูปพรีวิว (จะโผล่มาก็ต่อเมื่อเลือกรูปแล้ว) */}
            {imagePreview && (
                <div className="preview-container">
                    <img src={imagePreview} alt="Preview" className="preview-image" />
                    <button className="remove-image-btn" onClick={handleRemoveImage}>
                        <TbX size={18} strokeWidth={3} />
                    </button>
                </div>
            )}
            
            <div className="post-actions-row">
                <div className="icon-group">
                    {/* 🌟 ซ่อน input file ไว้ และใช้ ref */}
                    <input 
                        type="file" 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                        ref={fileInputRef}
                        onChange={handleImageChange}
                    />
                    
                    {/* 🌟 พอกดปุ่มนี้ ให้ไปสั่งคลิกที่ input file ที่ซ่อนอยู่ */}
                    <div className="icon-button" title="Add Photo" onClick={() => fileInputRef.current.click()}>
                        <TbPhoto size={24} strokeWidth={2.2} />
                    </div>
                    
                    <div className="icon-button" title="Draw Something">
                        <TbPencil size={24} strokeWidth={2.2} />
                    </div>
                    <div className="icon-button" title="Add Emoji">
                        <TbMoodSmile size={24} strokeWidth={2.2} />
                    </div>
                </div>

                <button className="btn-yellow btn-post" onClick={handlePost}>
                    Post!
                </button>
            </div>
        </div>
    );
}

export default CreatePostBox;