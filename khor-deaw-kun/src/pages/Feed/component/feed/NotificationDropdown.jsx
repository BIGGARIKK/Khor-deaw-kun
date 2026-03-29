import React, { useState, useEffect } from 'react';
import { TbX } from "react-icons/tb";
import { apiRequest } from '../../../../service/api'; 
import './NotificationDropdown.css';

const getAvatarUrl = (imageName, userName) => {
    if (!imageName) return `https://ui-avatars.com/api/?name=${userName || 'User'}&background=random`;
    if (imageName.startsWith('http')) return imageName;
    
    return `/avatars/${imageName}`; 
};

// 🌟 ฟังก์ชันจัดการเวลาแบบ "ครอบจักรวาล" (กันบั๊ก Invalid Date 100%)
const formatTimeAgo = (dateInput) => {
    // 1. ถ้าไม่มีข้อมูลส่งมา ให้ตีความว่าเพิ่งเกิด
    if (!dateInput) return 'เมื่อกี้';

    let date;

    // 2. ดักจับกรณี PyMongo ส่งมาเป็น Object { $date: ... }
    if (typeof dateInput === 'object' && dateInput.$date) {
        date = new Date(dateInput.$date);
    } else {
        // 3. กรณีส่งมาเป็น String ปกติ หรือ Timestamp
        date = new Date(dateInput);
    }

    // 4. ถ้าพยายามแปลงแล้วยังพังอีก (Invalid Date ค่า getTime() จะเป็น NaN)
    if (isNaN(date.getTime())) {
        console.error("❌ เจอวันที่แปลกประหลาดอ่านไม่ออก:", dateInput);
        return 'ไม่นานมานี้'; // เปลี่ยนข้อความไม่ให้หน้าเว็บดู Error
    }
    
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
                
                // 🌟 ดึงเอา Array ออกมาจาก data.notifications
                const notiList = data.notifications || [];
                setNotifications(notiList);
                setIsLoading(false);

                console.log("ข้อมูลแจ้งเตือนที่ได้จาก Server:", data);

                // 🌟 ใช้ unread_count ที่ Server ส่งมาให้เช็คได้เลยว่าต้องอัปเดตไหม
                if (data && data.unread_count > 0) {
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
                        notifications.map((noti) => {
                            // 🌟 ปรับให้รองรับทั้งข้อมูลแบบเก่าและแบบใหม่จาก Database
                            const senderName = noti.sender_username || noti.user;
                            const senderImage = noti.sender_image || noti.user_image;
                            const messageText = noti.message || noti.text;
                            const createdAt = noti.created_at || noti.create_at;
                            const isRead = noti.is_read ?? noti.isRead;

                            return (
                                <div key={noti._id || noti.id} className={`noti-item ${isRead ? 'read' : 'unread'}`}>
                                    
                                    <div className="noti-avatar-container" style={{ flexShrink: 0, marginRight: '12px' }}>
                                        <img 
                                            src={getAvatarUrl(senderImage, senderName)} 
                                            alt={senderName} 
                                            className="noti-profile-img"
                                            onError={(e) => {
                                                e.target.onerror = null; 
                                                e.target.src = `https://ui-avatars.com/api/?name=${senderName}&background=random`;
                                            }}
                                            style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #D7CCC8' }} 
                                        />
                                    </div>
                                    
                                    <div className="noti-content">
                                        <p><strong>{senderName}</strong> {messageText}</p>
                                        <span className="noti-time">{formatTimeAgo(createdAt)}</span>
                                    </div>
                                    {!isRead && <div className="noti-dot"></div>}
                                </div>
                            );
                        })
                    ) : (
                        <div className="noti-empty">ไม่มีการแจ้งเตือนใหม่ครับ 🏖️</div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default NotificationDropdown;