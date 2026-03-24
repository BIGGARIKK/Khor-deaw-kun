// RightSidebar.jsx
import React from 'react';
import './RightSidebar.css';

function RightSidebar() {
    return (
        <div className="wooden-box right-sidebar">
            <h3 className="trending-title">🔥 Trending Topics</h3>
            <div className="tag-list">
                <div className="tag-item"><span>#หาเพื่อนชนแก้ว</span> <span>🍻</span></div>
                <div className="tag-item"><span>#ร้านชิลล์พัทยา</span> <span>🌊</span></div>
            </div>
            <h3 className="trending-title" style={{marginTop: '25px'}}>🟢 Online Buddies</h3>
            <div className="buddy-list">
                <div className="buddy-item"><span className="status-dot"></span> Beach_Bum_99</div>
                <div className="buddy-item"><span className="status-dot"></span> Night_Owl</div>
            </div>
        </div>
    );
}
export default RightSidebar;