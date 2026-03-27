import React from 'react';
import './Sidebar.css';

function Sidebar() {
    return (
        <div className="left-sidebar">
            
            {/* 🏖️ Widget 1: สถานะโต๊ะของฉัน */}
            <div className="wooden-box widget-box">
                <div className="widget-header">
                    <h3>🥓 My Table</h3>
                    <span className="table-id">#1001</span>
                </div>
                <div className="table-members">
                    <div className="member-avatar">🥥</div>
                    <div className="member-avatar">🐶</div>
                    <div className="member-avatar empty">+</div>
                </div>
                <button className="btn-wood-small">🥂 ชนแก้วทั้งโต๊ะ!</button>
            </div>

            {/* 🎵 Widget 2: ตู้เพลงริมหาด */}
            <div className="wooden-box widget-box">
                <div className="widget-header">
                    <h3>🎵 Now Playing</h3>
                </div>
                <div className="jukebox-container">
                    <div className="vinyl-record"><div className="vinyl-center"></div></div>
                    <div className="song-info">
                        <strong className="song-title">ทะเลสีดำ</strong>
                        <span className="song-artist">Lula</span>
                    </div>
                </div>
            </div>

            {/* 🏆 Widget 3: Daily Quest (ที่หายไป เอากลับมาแล้ว!) */}
            <div className="wooden-box widget-box">
                <div className="widget-header">
                    <h3>🏆 Daily Cheers</h3>
                </div>
                <p className="mission-text">ชนแก้วกับเพื่อนใหม่ให้ครบ 5 คน</p>
                <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: '60%' }}></div>
                </div>
                <div className="progress-text">3 / 5 คน</div>
            </div>

            {/* 🌊 Widget 4: ไอเดียเพิ่ม บรรยากาศหาดจำลอง */}
            <div className="wooden-box widget-box vibe-box">
                <div className="vibe-icon">🌙</div>
                <div className="vibe-text">
                    <strong>บรรยากาศตอนนี้</strong>
                    <span>ลมทะเลเย็นสบาย คลื่นสงบ</span>
                </div>
            </div>

        </div>
    );
}

export default Sidebar;