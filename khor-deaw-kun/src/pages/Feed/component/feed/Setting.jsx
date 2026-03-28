import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TbX, TbLogout, TbEye, TbEyeOff } from "react-icons/tb";
import { apiRequest } from '../../../../service/api'; 
import './Settings.css';

function Settings({ onClose }) {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState('');
    const [loading, setLoading] = useState(false);

    // 👁️ State สำหรับเปิด-ปิดการมองเห็นรหัสผ่าน
    const [showOldPass, setShowOldPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await apiRequest("/profile", "GET");
                if (data) {
                    setUsername(data.username || '');
                    setEmail(data.email || '');
                    setSelectedAvatar(data.profile_image || '');
                }
            } catch (err) { console.error("Fetch profile failed:", err); }
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            const payload = { username, email, profile_image: selectedAvatar };
            if (newPassword) {
                payload.old_password = oldPassword;
                payload.new_password = newPassword;
            }
            await apiRequest('/profile', 'PUT', payload);
            alert("บันทึกสำเร็จ! ✨");
            onClose();
        } catch (error) {
            alert("บันทึกล้มเหลว: " + (error.message || "ตรวจสอบรหัสผ่านเดิม"));
        } finally { setLoading(false); }
    };

    const handleLogout = () => {
        if (window.confirm("ต้องการออกจากระบบใช่ไหม? 🍻")) {
            localStorage.removeItem('token'); // ลบ Token ออก
            navigate('/Signin');
        }
    };

    return (
        <div className="settings-modal-overlay" onClick={onClose}>
            <div className="settings-wood-card-modal" onClick={(e) => e.stopPropagation()}>
                <header className="settings-header">
                    <div style={{ width: 32 }}></div>
                    <h2>SETTING</h2>
                    {/* ปุ่มปิด Modal */}
                    <button type="button" className="close-x-btn" onClick={onClose}>
                        <TbX size={20} strokeWidth={4} />
                    </button>
                </header>

                <div className="settings-body-scroll">
                    <div className="input-group">
                        <label>ชื่อนักดื่ม</label>
                        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                    </div>

                    <div className="input-group">
                        <label>อีเมล</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>

                    <div className="input-group">
                        <label>เปลี่ยนรหัสผ่าน (ถ้ามี)</label>
                        
                        {/* 👁️ ช่องรหัสผ่านเดิม */}
                        <div className="password-input-wrapper">
                            <input 
                                type={showOldPass ? "text" : "password"} 
                                placeholder="รหัสผ่านเดิม" 
                                value={oldPassword} 
                                onChange={(e) => setOldPassword(e.target.value)} 
                            />
                            {/* ต้องใส่ type="button" เพื่อป้องกันการ submit */}
                            <button type="button" className="eye-btn" onClick={() => setShowOldPass(!showOldPass)}>
                                {showOldPass ? <TbEyeOff size={20} /> : <TbEye size={20} />}
                            </button>
                        </div>

                        {/* 👁️ ช่องรหัสผ่านใหม่ */}
                        <div className="password-input-wrapper">
                            <input 
                                type={showNewPass ? "text" : "password"} 
                                placeholder="รหัสผ่านใหม่" 
                                value={newPassword} 
                                onChange={(e) => setNewPassword(e.target.value)} 
                            />
                            <button type="button" className="eye-btn" onClick={() => setShowNewPass(!showNewPass)}>
                                {showNewPass ? <TbEyeOff size={20} /> : <TbEye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button className="save-large-btn" onClick={handleSave} disabled={loading}>
                        {loading ? "กำลังบันทึก..." : "ยืนยันการแก้ไข"}
                    </button>

                    <button className="logout-btn" onClick={handleLogout}>
                        <TbLogout size={20} /> ออกจากระบบ
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Settings;