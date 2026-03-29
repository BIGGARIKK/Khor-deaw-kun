import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { TbSunset, TbMap2, TbBell, TbSettings, TbX, TbChevronRight } from "react-icons/tb";
import { apiRequest } from '../../../../service/api';
import './Bottombar.css';

// ⚙️ Import Components อื่นๆ
import Settings from './Setting'; 
// 🌟 Import กล่องแจ้งเตือนที่เราเพิ่งสร้าง
import NotificationDropdown from './NotificationDropdown'; 

function BottomBar() {
    const navigate = useNavigate();
    const location = useLocation();
    
    // States ควบคุมการเปิด/ปิดหน้าต่างต่างๆ
    const [showProfileSheet, setShowProfileSheet] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false); 
    const [showNotifications, setShowNotifications] = useState(false); 
    
    const [userData, setUserData] = useState(null);
    const [currentVibe, setCurrentVibe] = useState('chill');

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await apiRequest("/profile", "GET");
                setUserData(data);
                if (data.vibe_status) setCurrentVibe(data.vibe_status);
                else if (data.vibe) setCurrentVibe(data.vibe);
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
            {/* 🌟 แสดงกล่องแจ้งเตือนเหนือ Bottom Bar ถ้ายูสเซอร์กดปุ่มกระดิ่ง */}
            {showNotifications && (
                <div style={{ position: 'fixed', bottom: '80px', right: '20px', zIndex: 1000 }}>
                    <NotificationDropdown onClose={() => setShowNotifications(false)} />
                </div>
            )}

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
                            <img src={`/avatars/${userData.profile_image}`} alt="Profile" />
                        ) : (
                            <div className="profile-placeholder" />
                        )}
                    </div>
                </div>

                {/* 🌟 ปุ่ม Shouts สลับเปิด/ปิดกล่องแจ้งเตือน */}
                <div className={`nav-item ${showNotifications ? 'active' : ''}`} onClick={() => setShowNotifications(!showNotifications)}>
                    <TbBell size={28} />
                    <span className="nav-label">Notifications</span>
                </div>

                <div className="nav-item" onClick={() => setShowSettingsModal(true)}>
                    <TbSettings size={28} />
                    <span className="nav-label">Setting</span>
                </div>
            </div>

            {/* =========================================
                ⚙️ Settings Modal
            ========================================= */}
            {showSettingsModal && createPortal(
                <Settings onClose={() => setShowSettingsModal(false)} />,
                document.body
            )}

            {/* =========================================
                🌟 Profile Bottom Sheet
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
                                    <img src={`/avatars/${userData.profile_image}`} alt="Profile" />
                                )}
                            </div>
                            <div className="sheet-user-info">
                                <h2>{userData?.display_name || userData?.username || 'กำลังโหลด...'}</h2>
                                <span className="profile-badge">{userData?.badge || 'BEACH VIP 🌴'}</span>
                            </div>
                        </div>

                        {/* <div className="vibe-check-section">
                            <h3 className="section-title">สถานะตอนนี้ (Vibe Check)</h3>
                            <div className="vibe-options">
                                <button className={`vibe-btn ${currentVibe === 'chill' ? 'active-chill' : ''}`} onClick={() => handleVibeChange('chill')}>🟢 ชิลล์ๆ</button>
                                <button className={`vibe-btn ${currentVibe === 'tipsy' ? 'active-tipsy' : ''}`} onClick={() => handleVibeChange('tipsy')}>🟡 กรึ่มๆ</button>
                                <button className={`vibe-btn ${currentVibe === 'wasted' ? 'active-wasted' : ''}`} onClick={() => handleVibeChange('wasted')}>🔴 ภาพตัด</button>
                            </div>
                        </div> */}

                        <div className="quick-stats">
                            <div className="stat-box"><strong>{userData?.stats?.postCount || 0}</strong><span>Shouts</span></div>
                            
                            {/* 🌟 อัปเดตตรงนี้เป็น Followers และ Following */}
                            <div className="stat-box"><strong>{userData?.followers?.length || 0}</strong><span>Followers</span></div>
                            <div className="stat-box"><strong>{userData?.following?.length || 0}</strong><span>Following</span></div>
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