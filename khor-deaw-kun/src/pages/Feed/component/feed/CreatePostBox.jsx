import React, { useState, useRef, useEffect } from 'react';
import { TbPhoto, TbMoodSmile, TbSend, TbX } from "react-icons/tb";
import { useLocation } from 'react-router-dom'; 
import './CreatePostBox.css';
import { apiRequest } from '../../../../service/api';

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/duvkwerga/image/upload";
const UPLOAD_PRESET = "ml_default";

function CreatePostBox({ onPost }) {
    const [text, setText] = useState('');
    const [imagePreview, setImagePreview] = useState(null); 
    const [selectedFile, setSelectedFile] = useState(null); 
    const [isUploading, setIsUploading] = useState(false);
    
    const fileInputRef = useRef(null);
    const [userdata, setUserData] = useState(null);
    
    const location = useLocation(); 

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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file); 
            setImagePreview(URL.createObjectURL(file)); 
        }
    };

    const handleRemoveImage = () => {
        setImagePreview(null);
        setSelectedFile(null); 
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

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
            return data.secure_url; 
        } catch (error) {
            console.error("Upload Image Error:", error);
            return null;
        }
    };

    const handlePost = async () => {
        if (!text.trim() && !selectedFile) return;

        setIsUploading(true);

        try {
            let finalImageUrl = null;

            if (selectedFile) {
                finalImageUrl = await uploadImageToCloud(selectedFile);
            }

            const postData = {
                text: text.trim(),
                image_url: finalImageUrl 
            };

            await apiRequest('/posts', 'POST', postData);
            
            onPost(); 
            setText('');
            handleRemoveImage();

        } catch (error) {
            console.error("Post Error:", error);
            alert("Shout ไม่สำเร็จ! ลองใหม่อีกครั้งนะ 🍻");
        } finally {
            setIsUploading(false);
        }
    };

    // 🌟 ฟังก์ชันดึงพิกัด (เวอร์ชันอัปเกรด ค้นหาจาก LocalStorage ด้วย)
    // 🌟 ฟังก์ชันดึงพิกัด (เวอร์ชันดึงจาก active_room)
    const handleLocationClick = () => {
        if (isUploading) return;
        
        // 1. ลองดึงจากที่เก็บไว้ (ถ้าเข้าห้องแล้ว จะมีค่านี้)
        const savedRoom = localStorage.getItem('active_room');
        
        if (savedRoom) {
            insertText(`[📍 โต๊ะ ${savedRoom}]`);
        } else {
            // ถ้าไม่มี (ยังไม่เข้าห้อง)
            insertText('[📍 ริมหาดชิลล์ๆ]');
        }
    };

    return (
        <div className="wooden-box create-post-premium">
            <div className="create-post-top">
                <div className="author-avatar-large">
                    <img src={`/avatars/${userImage}`} alt="Profile" />
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
                    
                    <div className="tool-btn" onClick={handleLocationClick}>
                        <span style={{ fontSize: '1.2rem' }}>📍</span>
                    </div>
                    
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