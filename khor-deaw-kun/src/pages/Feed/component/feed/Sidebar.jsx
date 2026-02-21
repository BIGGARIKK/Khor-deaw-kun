import React from 'react';
import './Sidebar.css'; // 🌟 อย่าลืม import ไฟล์ CSS เข้ามา
import Profile from './Profile';
import { TbHome, TbCompass, TbBell, TbSettings, TbPencilPlus } from "react-icons/tb";

function Sidebar() {
    const iconSize = 28; 
    const strokeWidth = 2;

    return (
        <div className="sidebar">
            
            {/* --- ส่วนบน (โลโก้ + โปรไฟล์ + เมนู) --- */}
            <div className="sidebar-top">
                <div className="logo">Khor Deaw Kun</div>

                {/* 🌟 ย้าย Profile มาไว้ใต้โลโก้ตามโค้ดที่คุณส่งมา */}
                <div className="profile-container">
                    <Profile />
                </div>

                <ul className="nav-links">
                    <li className="nav-item">
                        <TbHome size={iconSize} strokeWidth={strokeWidth} />
                        <span>Feed</span>
                    </li>
                    
                    <li className="nav-item">
                        <TbCompass size={iconSize} strokeWidth={strokeWidth} />
                        <span>Explore</span>
                    </li>
                    
                    <li className="nav-item">
                        <TbBell size={iconSize} strokeWidth={strokeWidth} />
                        <span>Notifications</span>
                    </li>
                    
                    <li className="nav-item">
                        <TbSettings size={iconSize} strokeWidth={strokeWidth} />
                        <span>Settings</span>
                    </li>
                </ul>


            </div>
            
        </div>
    );
}

export default Sidebar;