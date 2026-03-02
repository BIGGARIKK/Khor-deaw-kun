import React from 'react';
import './Sidebar.css';
import Profile from './Profile';
import { TbHome, TbCompass, TbBell, TbSettings } from "react-icons/tb";
import { useNavigate } from 'react-router-dom'; 

function Sidebar() {
    const navigate = useNavigate();
    const iconSize = 28; 

    return (
        <div className="sidebar">
            <div className="sidebar-top">
                <div className="logo">Khor Deaw Kun</div>

                {/* กดที่รูปโปรไฟล์เพื่อไปหน้า Profile */}
                <div className="profile-container" onClick={() => navigate('/profile')}>
                    <Profile />
                </div>

                <ul className="nav-links">
                    <li className="nav-item" onClick={() => navigate('/feed')}>
                        <TbHome size={iconSize} /> <span>Feed</span>
                    </li>
                    <li className="nav-item">
                        <TbCompass size={iconSize} /> <span>Explore</span>
                    </li>
                    <li className="nav-item">
                        <TbBell size={iconSize} /> <span>Notifications</span>
                    </li>
                    <li className="nav-item">
                        <TbSettings size={iconSize} /> <span>Settings</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}
export default Sidebar;