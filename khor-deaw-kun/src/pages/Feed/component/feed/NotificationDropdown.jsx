import React, { useState, useEffect } from 'react';
import { TbX } from "react-icons/tb";
import { apiRequest } from '../../../../service/api'; 
import './NotificationDropdown.css';

// 🌟 1. แก้ Path รูปให้ตรงกับที่เก็บจริงของโปรเจกต์คุณ
const getAvatarUrl = (imageName, userName) => {
    if (!imageName) return `https://ui-avatars.com/api/?name=${userName || 'User'}&background=random`;
    if (imageName.startsWith('http')) return imageName;
    
    // 🌟 เปลี่ยนมาใช้ Path เดียวกับ PostCard.jsx
    return `/src/assets/avatars/${imageName}`; 
};

const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 0 || diffInSeconds < 60) return 'เมื่อกี้';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} นาทีที่แล้ว`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ชั่วโมงที่แล้ว`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} วันที่แล้ว`;

    return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
};

function NotificationDropdown({ onClose }) {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const data = await apiRequest('/notifications', 'GET');
                setNotifications(data || []);
                setIsLoading(false);

                // 🌟 แอบปริ้นท์ดูใน F12 ว่า Server ส่ง user_image มาให้ไหม?
                console.log("ข้อมูลแจ้งเตือนที่ได้จาก Server:", data);

                if (data && data.some(n => !n.isRead)) {
                    await apiRequest('/notifications/read', 'PUT');
                }
            } catch (error) {
                console.error("Failed to fetch notifications", error);
                setIsLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    return (
        <div className="noti-modal-overlay" onClick={onClose}>
            
            <div className="noti-modal-content wooden-box" onClick={(e) => e.stopPropagation()}>
                
                <div className="noti-header">
                    <h3>การแจ้งเตือน</h3>
                    <button className="noti-close-btn" onClick={onClose}>
                        <TbX size={24} strokeWidth={3} />
                    </button>
                </div>
                
                <div className="noti-list">
                    {isLoading ? (
                        <div className="noti-empty">กำลังโหลดข้อมูล... ⏳</div>
                    ) : notifications.length > 0 ? (
                        notifications.map((noti) => (
                            <div key={noti.id} className={`noti-item ${noti.isRead ? 'read' : 'unread'}`}>
                                
                                <div className="noti-avatar-container" style={{ flexShrink: 0, marginRight: '12px' }}>
                                    <img 
                                        src={getAvatarUrl(noti.user_image, noti.user)} 
                                        alt={noti.user} 
                                        className="noti-profile-img"
                                        onError={(e) => {
                                            e.target.onerror = null; 
                                            e.target.src = `https://ui-avatars.com/api/?name=${noti.user}&background=random`;
                                        }}
                                        style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #D7CCC8' }} 
                                    />
                                </div>
                                
                                <div className="noti-content">
                                    <p><strong>{noti.user}</strong> {noti.text}</p>
                                    <span className="noti-time">{formatTimeAgo(noti.create_at)}</span>
                                </div>
                                {!noti.isRead && <div className="noti-dot"></div>}
                            </div>
                        ))
                    ) : (
                        <div className="noti-empty">ไม่มีการแจ้งเตือนใหม่ครับ 🏖️</div>
                    )}
                </div>

            </div>
        </div>
    );
}

export default NotificationDropdown;