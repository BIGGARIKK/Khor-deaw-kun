import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { TbSunset, TbMap2, TbBell, TbSettings, TbX, TbChevronRight } from "react-icons/tb";
import { apiRequest } from '../../../../service/api';
import './BottomBar.css';


function BottomBar() {
    const navigate = useNavigate();
    const [showProfileSheet, setShowProfileSheet] = useState(false);
    const [currentVibe, setCurrentVibe] = useState('chill');
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await apiRequest("/profile", "GET");
                setUserData(data);
                // ถ้ามี vibe_status จาก DB ให้เซ็ตค่าตาม DB เลย
                if (data.vibe_status) setCurrentVibe(data.vibe_status);
            } catch (error) {
                console.error('Failed to fetch profile data:', error);
            }
        };
        loadProfile();
    }, []);

    // 🌟 กำหนดรูปโปรไฟล์สำรองระหว่างรอข้อมูลโหลด
    const userImage = userData?.profile_image;

    return (
        <>
            <div className="bottom-nav-container" >
                <div className="nav-item active" onClick={() => navigate("/beach")}>
                    <TbSunset size={28} />
                    <span className="nav-label">Beach</span>
                </div>

                <div className="nav-item" onClick={() => navigate("/hub")}>
                    <TbMap2 size={28} />
                    <span className="nav-label" >Hub</span>
                </div>

                {/* 🌟 ปุ่ม Profile ตรงกลาง */}
                <div className="nav-profile-center" onClick={() => setShowProfileSheet(true)}>
                    <div className="profile-frame">
                        {/* ลบกล่อง profile-img ออก แล้วเอา img วางตรงนี้เลยครับ 👇 */}
                        <img
                            src={`/src/assets/avatars/${userImage}`}
                            alt="Profile"
                        />
                    </div>
                </div>
                
                <div className="nav-item">
                    <TbBell size={28} />
                    <span className="nav-label">Shouts</span>
                </div>

                <div className="nav-item">
                    <TbSettings size={28} />
                    <span className="nav-label">Gear</span>
                </div>
            </div>

            {/* =========================================
                🌟 Profile Bottom Sheet (แผ่นไม้เลื่อนจากขอบล่าง)
            ========================================= */}
            {showProfileSheet && createPortal(
                <div className="profile-sheet-overlay" onClick={() => setShowProfileSheet(false)}>
                    <div className="profile-sheet-content" onClick={(e) => e.stopPropagation()}>

                        <div className="sheet-drag-handle"></div>

                        <button className="sheet-close-btn" onClick={() => setShowProfileSheet(false)}>
                            <TbX size={24} strokeWidth={3} />
                        </button>

                        {/* 👤 ข้อมูลส่วนตัวเบื้องต้น (แก้ให้ซิงค์กับ DB แล้ว) */}
                        <div className="sheet-header">
                            <div className="sheet-avatar">
                                <img
                                    src={`/src/assets/avatars/${userImage}`}
                                    alt="Profile"
                                />
                            </div>
                            <div className="sheet-user-info">
                                {/* 🌟 ใส่ ?. ป้องกันเว็บแดงเวลารีเฟรช */}
                                <h2>{userData?.username || 'Loading...'}</h2>
                                <span className="profile-badge">{userData?.badge || 'BEACH VIP 🌴'}</span>
                            </div>
                        </div>

                        {/* 🚥 Vibe Check (สเตตัสนักดื่ม) */}
                        <div className="vibe-check-section">
                            <h3 className="section-title">สถานะตอนนี้ (Vibe Check)</h3>
                            <div className="vibe-options">
                                <button
                                    className={`vibe-btn ${currentVibe === 'chill' ? 'active-chill' : ''}`}
                                    onClick={() => setCurrentVibe('chill')}
                                >
                                    🟢 ชิลล์ๆ
                                </button>
                                <button
                                    className={`vibe-btn ${currentVibe === 'tipsy' ? 'active-tipsy' : ''}`}
                                    onClick={() => setCurrentVibe('tipsy')}
                                >
                                    🟡 กรึ่มๆ
                                </button>
                                <button
                                    className={`vibe-btn ${currentVibe === 'wasted' ? 'active-wasted' : ''}`}
                                    onClick={() => setCurrentVibe('wasted')}
                                >
                                    🔴 ภาพตัด
                                </button>
                            </div>
                        </div>

                        {/* 📊 สถิติ (ดึงจาก DB) */}
                        <div className="quick-stats">
                            <div className="stat-box"><strong>{userData?.stats?.postCount || 0}</strong><span>Shouts</span></div>
                            <div className="stat-box"><strong>{userData?.stats?.cheersCount || 0}</strong><span>Cheers!</span></div>
                            <div className="stat-box"><strong>#1001</strong><span>Table</span></div>
                        </div>

                        {/* ➡️ ปุ่มไปหน้า Profile เต็มๆ */}
                        <button className="full-profile-btn" onClick={() => navigate("/profile")}>
                            ดูโปรไฟล์ฉบับเต็ม <TbChevronRight size={24} />
                        </button>

                    </div>
                </div>,
                document.body
            )}
        </>
    );
}

export default BottomBar;