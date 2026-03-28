import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { TbSunset, TbMap2, TbBell, TbSettings, TbX, TbChevronRight } from "react-icons/tb";
import { apiRequest } from '../../../../service/api';
import './BottomBar.css';

// ⚙️ Import หน้า Settings มาใช้เป็น Modal
// เช็ค Path อีกทีนะครับว่าอยู่ที่ '../../Settings/Setting' หรือเปล่า ตามที่คุณวางไฟล์ไว้
import Settings from './Setting'; 

function BottomBar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [showProfileSheet, setShowProfileSheet] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false); // ⚙️ เพิ่ม State สำหรับเปิด/ปิด Gear
    const [userData, setUserData] = useState(null);
    const [currentVibe, setCurrentVibe] = useState('chill');

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await apiRequest("/profile", "GET");
                setUserData(data);
                if (data.vibe_status) {
                    setCurrentVibe(data.vibe_status);
                } else if (data.vibe) {
                    setCurrentVibe(data.vibe);
                }
            } catch (error) {
                console.error('Failed to fetch profile data:', error);
            }
        };
        loadProfile();
    }, []);

    const handleVibeChange = async (newVibe) => {
        setCurrentVibe(newVibe);
        try {
            await apiRequest('/profile', 'PUT', { vibe: newVibe });
            setUserData(prev => ({ ...prev, vibe: newVibe }));
        } catch (error) {
            alert("เปลี่ยนสถานะไม่สำเร็จ ลองใหม่อีกครั้งนะ 😅");
        }
    };

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <>
            <div className="bottom-nav-container">
                <div className={`nav-item ${isActive('/beach')}`} onClick={() => navigate("/beach")}>
                    <TbSunset size={28} />
                    <span className="nav-label">Beach</span>
                </div>

                <div className={`nav-item ${isActive('/hub')}`} onClick={() => navigate("/hub")}>
                    <TbMap2 size={28} />
                    <span className="nav-label">Hub</span>
                </div>

                <div className="nav-profile-center" onClick={() => setShowProfileSheet(true)}>
                    <div className="profile-frame">
                        {userData?.profile_image ? (
                            <img src={`/src/assets/avatars/${userData.profile_image}`} alt="Profile" />
                        ) : (
                            <div className="profile-placeholder" />
                        )}
                    </div>
                </div>

                <div className={`nav-item ${isActive('/shouts')}`}>
                    <TbBell size={28} />
                    <span className="nav-label">Shouts</span>
                </div>

                {/* ⚙️ ปุ่ม Gear: เปลี่ยนจาก navigate เป็นการเปิด Modal แทน */}
                <div className="nav-item" onClick={() => setShowSettingsModal(true)}>
                    <TbSettings size={28} />
                    <span className="nav-label">Gear</span>
                </div>
            </div>

            {/* =========================================
                ⚙️ Settings Modal (เด้งขึ้นมากลางจอ)
            ========================================= */}
            {showSettingsModal && createPortal(
                <Settings onClose={() => setShowSettingsModal(false)} />,
                document.body
            )}

            {/* =========================================
                🌟 Profile Bottom Sheet (เลื่อนจากข้างล่าง)
            ========================================= */}
            {showProfileSheet && createPortal(
                <div className="profile-sheet-overlay" onClick={() => setShowProfileSheet(false)}>
                    <div className="profile-sheet-content" onClick={(e) => e.stopPropagation()}>
                        <div className="sheet-drag-handle"></div>
                        <button className="sheet-close-btn" onClick={() => setShowProfileSheet(false)}>
                            <TbX size={24} strokeWidth={3} />
                        </button>

                        <div className="sheet-header">
                            <div className="sheet-avatar">
                                {userData?.profile_image && (
                                    <img src={`/src/assets/avatars/${userData.profile_image}`} alt="Profile" />
                                )}
                            </div>
                            <div className="sheet-user-info">
                                <h2>{userData?.username || 'กำลังโหลด...'}</h2>
                                <span className="profile-badge">{userData?.badge || 'BEACH VIP 🌴'}</span>
                            </div>
                        </div>

                        <div className="vibe-check-section">
                            <h3 className="section-title">สถานะตอนนี้ (Vibe Check)</h3>
                            <div className="vibe-options">
                                <button className={`vibe-btn ${currentVibe === 'chill' ? 'active-chill' : ''}`} onClick={() => handleVibeChange('chill')}>🟢 ชิลล์ๆ</button>
                                <button className={`vibe-btn ${currentVibe === 'tipsy' ? 'active-tipsy' : ''}`} onClick={() => handleVibeChange('tipsy')}>🟡 กรึ่มๆ</button>
                                <button className={`vibe-btn ${currentVibe === 'wasted' ? 'active-wasted' : ''}`} onClick={() => handleVibeChange('wasted')}>🔴 ภาพตัด</button>
                            </div>
                        </div>

                        <div className="quick-stats">
                            <div className="stat-box"><strong>{userData?.stats?.postCount || 0}</strong><span>Shouts</span></div>
                            <div className="stat-box"><strong>{userData?.stats?.cheersCount || 0}</strong><span>Cheers!</span></div>
                            <div className="stat-box"><strong>#1001</strong><span>Table</span></div>
                        </div>

                        <button className="full-profile-btn" onClick={() => { setShowProfileSheet(false); navigate(`/profile/${userData?.username}`); }}>
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