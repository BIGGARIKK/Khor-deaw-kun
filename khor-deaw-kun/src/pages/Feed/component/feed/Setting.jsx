import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TbX, TbLogout, TbEye, TbEyeOff, TbAlertCircle, TbCheck } from "react-icons/tb";
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

    // 🌟 State สำหรับ Custom Pop-up
    const [popup, setPopup] = useState({ show: false, message: '', type: 'info', onConfirm: null });

    const showPopup = (message, type = 'info', onConfirm = null) => {
        setPopup({ show: true, message, type, onConfirm });
    };

    const closePopup = () => {
        setPopup({ show: false, message: '', type: 'info', onConfirm: null });
    };

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
            const payload = { email, profile_image: selectedAvatar };
            
            if (newPassword) {
                if (!oldPassword) {
                    showPopup("⚠️ กรุณาใส่รหัสผ่านเดิมเพื่อยืนยันด้วยครับ", "error");
                    setLoading(false);
                    return;
                }
                payload.old_password = oldPassword;
                payload.new_password = newPassword;
            }

            await apiRequest('/profile', 'PUT', payload);
            
            // เคลียร์ช่องรหัสผ่านให้ว่างหลังจากบันทึกเสร็จ
            setOldPassword('');
            setNewPassword('');
            
            showPopup("บันทึกข้อมูลสำเร็จ! ✨", "success", () => {
                closePopup();
                onClose(); // ปิดหน้า Setting หลังจากกดตกลง
            });

        } catch (error) {
            showPopup("บันทึกล้มเหลว: " + (error.message || "ตรวจสอบรหัสผ่านเดิมอีกครั้ง"), "error");
        } finally { 
            setLoading(false); 
        }
    };

    const handleLogout = () => {
        showPopup("ต้องการออกจากระบบใช่ไหม? 🍻", "confirm", () => {
            localStorage.removeItem('token'); 
            navigate('/Signin');
        });
    };

    return (
        <div className="settings-modal-overlay" onClick={onClose}>
            <div className="settings-wood-card-modal" onClick={(e) => e.stopPropagation()}>
                <header className="settings-header">
                    <div style={{ width: 32 }}></div>
                    <h2>SETTING</h2>
                    <button type="button" className="close-x-btn" onClick={onClose}>
                        <TbX size={20} strokeWidth={4} />
                    </button>
                </header>

                <div className="settings-body-scroll">
                    <div className="input-group">
                        <label>ชื่อนักดื่ม (ไม่สามารถเปลี่ยนได้)</label>
                        <input 
                            type="text" 
                            value={username} 
                            disabled 
                            style={{ backgroundColor: '#EFEBE9', color: '#A1887F', cursor: 'not-allowed' }}
                        />
                    </div>

                    <div className="input-group">
                        <label>อีเมล</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>

                    <div className="input-group">
                        <label>เปลี่ยนรหัสผ่าน (ถ้ามี)</label>
                        
                        <div className="password-input-wrapper">
                            <input 
                                type={showOldPass ? "text" : "password"} 
                                placeholder="รหัสผ่านเดิม" 
                                value={oldPassword} 
                                onChange={(e) => setOldPassword(e.target.value)} 
                            />
                            <button type="button" className="eye-btn" onClick={() => setShowOldPass(!showOldPass)}>
                                {showOldPass ? <TbEyeOff size={20} /> : <TbEye size={20} />}
                            </button>
                        </div>

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

            {/* 🌟 Custom Pop-up Modal */}
            {popup.show && (
                <div 
                    className="custom-popup-overlay" 
                    onClick={closePopup}
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 10000,
                        display: 'flex', justifyContent: 'center', alignItems: 'center'
                    }}
                >
                    <div 
                        className="custom-popup-content" 
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            backgroundColor: '#FFF8F6', padding: '25px', borderRadius: '15px',
                            border: '3px solid #8D6E63', textAlign: 'center', width: '90%', maxWidth: '320px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.3)', animation: 'popIn 0.3s ease-out'
                        }}
                    >
                        <div style={{ marginBottom: '15px', color: popup.type === 'error' ? '#D8435A' : '#84E045' }}>
                            {popup.type === 'error' ? <TbAlertCircle size={50} /> : (popup.type === 'success' ? <TbCheck size={50} /> : null)}
                        </div>
                        
                        <p style={{ fontSize: '1.1rem', color: '#3E2723', fontWeight: 'bold', margin: '0 0 20px 0', lineHeight: '1.5' }}>
                            {popup.message}
                        </p>
                        
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            {popup.type === 'confirm' ? (
                                <>
                                    <button 
                                        onClick={() => { if(popup.onConfirm) popup.onConfirm(); closePopup(); }}
                                        style={{ padding: '8px 20px', backgroundColor: '#e4aa40', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold', cursor: 'pointer', flex: 1 }}
                                    >
                                        ยืนยัน
                                    </button>
                                    <button 
                                        onClick={closePopup}
                                        style={{ padding: '8px 20px', backgroundColor: '#ccc', border: 'none', borderRadius: '8px', color: '#333', fontWeight: 'bold', cursor: 'pointer', flex: 1 }}
                                    >
                                        ยกเลิก
                                    </button>
                                </>
                            ) : (
                                <button 
                                    onClick={() => { if(popup.onConfirm) popup.onConfirm(); closePopup(); }}
                                    style={{ padding: '8px 30px', backgroundColor: '#e4aa40', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                    ตกลง
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Settings;