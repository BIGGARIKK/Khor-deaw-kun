import React, { useState } from 'react';
import { TbX } from "react-icons/tb"; // นำเข้าไอคอนปุ่มปิด
import './NotificationDropdown.css';

// 🌟 รับ prop onClose มาจาก BottomBar
function NotificationDropdown({ onClose }) {
    // ข้อมูลจำลอง
    const [notifications, setNotifications] = useState([
        { id: 1, type: 'like', user: 'BIGGARIKK', text: 'ถูกใจโพสต์หมูกระทะของคุณ', time: '2 นาทีที่แล้ว', isRead: false },
        { id: 2, type: 'follow', user: 'NongMeow', text: 'เริ่มติดตามคุณแล้ว', time: '15 นาทีที่แล้ว', isRead: false },
        { id: 3, type: 'cheers', user: 'SeaBreeze', text: 'มาชนแก้วกับคุณที่โต๊ะ #12', time: '1 ชั่วโมงที่แล้ว', isRead: true },
    ]);

    const getIcon = (type) => {
        switch(type) {
            case 'like': return '❤️';
            case 'follow': return '🏃‍♂️';
            case 'cheers': return '🍻';
            default: return '🔔';
        }
    };

    return (
        /* 🌟 1. พื้นหลังสีดำโปร่งใส กดเพื่อปิดได้ */
        <div className="noti-modal-overlay" onClick={onClose}>
            
            <div className="noti-modal-content wooden-box" onClick={(e) => e.stopPropagation()}>
                
                <div className="noti-header">
                    <h3>การแจ้งเตือน</h3>
                    {/* ปุ่ม X สำหรับปิด */}
                    <button className="noti-close-btn" onClick={onClose}>
                        <TbX size={24} strokeWidth={3} />
                    </button>
                </div>
                
                <div className="noti-list">
                    {notifications.length > 0 ? (
                        notifications.map((noti) => (
                            <div key={noti.id} className={`noti-item ${noti.isRead ? 'read' : 'unread'}`}>
                                <div className="noti-icon">{getIcon(noti.type)}</div>
                                <div className="noti-content">
                                    <p><strong>{noti.user}</strong> {noti.text}</p>
                                    <span className="noti-time">{noti.time}</span>
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