import React, { useState, useRef, useEffect } from 'react';
import { TbPhoto, TbMoodSmile, TbSend, TbX } from "react-icons/tb";
import './CreatePostBox.css';
import { apiRequest } from '../../../../service/api';

// 🌟 กุญแจ Cloudinary ของคุณ
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/duvkwerga/image/upload";
const UPLOAD_PRESET = "ml_default";

function CreatePostBox({ onPost }) {
    const [text, setText] = useState('');
    const [imagePreview, setImagePreview] = useState(null); // ไว้โชว์รูปบนเว็บตอนพรีวิว
    const [selectedFile, setSelectedFile] = useState(null); // 🌟 เพิ่มตัวนี้! เก็บไฟล์จริงไว้รอส่งขึ้น Cloud
    const [isUploading, setIsUploading] = useState(false);
    
    const fileInputRef = useRef(null);
    const [userdata, setUserData] = useState(null);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await apiRequest('/profile', 'GET');
                setUserData(data);
            } catch (error) {
                console.error('Failed to fetch profile data:', error);
            }
        };
        loadProfile();
    }, []);

    const userImage = userdata?.profile_image || '1.png';
    const insertText = (str) => setText((prev) => prev + " " + str);

    // 🌟 1. เลือกรูปปุ๊บ เก็บไฟล์จริงไว้ใน State และสร้าง URL ชั่วคราวไว้โชว์
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file); // เก็บไฟล์ตัวจริง!
            setImagePreview(URL.createObjectURL(file)); // สร้างลิงก์หลอกไว้โชว์เฉยๆ
        }
    };

    const handleRemoveImage = () => {
        setImagePreview(null);
        setSelectedFile(null); // 🌟 ล้างไฟล์จริงทิ้งด้วย
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // 🌟 2. ฟังก์ชันคุยกับ Cloudinary
    const uploadImageToCloud = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);

        try {
            const response = await fetch(CLOUDINARY_URL, {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            return data.secure_url; // จะได้ลิงก์จริงกลับมา เช่น https://res.cloudinary...
        } catch (error) {
            console.error("Upload Image Error:", error);
            return null;
        }
    };

    // 🌟 3. กด Shout ปุ๊บ อัปขึ้น Cloud ก่อน ค่อยส่งลิงก์เข้า Database ของเรา
    const handlePost = async () => {
        if (!text.trim() && !selectedFile) return;

        setIsUploading(true);

        try {
            let finalImageUrl = null;

            // ถ้ามียูสเซอร์แนบรูปมา ให้เอาไปฝาก Cloudinary ก่อน!
            if (selectedFile) {
                finalImageUrl = await uploadImageToCloud(selectedFile);
            }

            // เตรียมข้อมูลส่งให้ Flask
            const postData = {
                text: text.trim(),
                image_url: finalImageUrl // 🌟 ส่งลิงก์จริง (https://...) ไปให้ DB เก็บ
            };

            await apiRequest('/posts', 'POST', postData);
            
            onPost(); // สั่งหน้า Feed รีเฟรช
            setText('');
            handleRemoveImage();

        } catch (error) {
            console.error("Post Error:", error);
            alert("Shout ไม่สำเร็จ! ลองใหม่อีกครั้งนะ 🍻");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="wooden-box create-post-premium">
            <div className="create-post-top">
                <div className="author-avatar-large">
                    <img src={`/src/assets/avatars/${userImage}`} alt="Profile" />
                </div>
                <textarea 
                    className="premium-textarea" placeholder="คืนนี้ชิลล์ไหนดี? ส่งเสียงหน่อย! 🍻🌊" 
                    value={text} onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlePost(); } }}
                    disabled={isUploading}
                />
            </div>

            {imagePreview && (
                <div className="polaroid-preview-wrapper">
                    <div className="polaroid-card">
                        <img src={imagePreview} alt="Preview" className="polaroid-img" />
                        <button className="polaroid-remove-btn" onClick={handleRemoveImage} disabled={isUploading}>
                            <TbX size={20} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            )}
            
            <div className="premium-actions-row">
                <div className="premium-tools">
                    <input type="file" accept="image/*" style={{ display: 'none' }} ref={fileInputRef} onChange={handleImageChange} />
                    <div className="tool-btn" onClick={() => !isUploading && fileInputRef.current.click()}><TbPhoto size={24} /></div>
                    <div className="tool-btn" onClick={() => !isUploading && insertText('[📍 โต๊ะ 1001]')}><span style={{ fontSize: '1.2rem' }}>📍</span></div>
                    <div className="tool-btn" onClick={() => !isUploading && insertText('🍻')}><TbMoodSmile size={24} /></div>
                </div>
                
                <button className="shout-btn" onClick={handlePost} disabled={isUploading}>
                    {isUploading ? "กำลัง Shout... ⏳" : <><TbSend size={20} /> Shout!</>}
                </button>
            </div>
        </div>
    );
}

export default CreatePostBox;