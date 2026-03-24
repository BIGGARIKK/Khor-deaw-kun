import React, { useState } from 'react';
import BottomBar from '../Feed/component/feed/BottomBar';
import Beach from '../Feed/Feed';
import './Hub.css';

function Hub() {
    const [searchId, setSearchId] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    const handleSearchRoom = (e) => {
        e.preventDefault();
        if (!searchId) return;
        console.log("Searching for Room ID:", searchId);
    };

    return (
        <div className="room-selection-bg">

            {/* 👤 User Profile (มุมขวาบน) */}
            <div className="user-profile-bar">
                <div className="user-info">
                    <div className="user-avatar">🥥</div>
                    <span className="user-name">Coconuto_Kun</span>
                </div>
                <div className="user-stats">🍻 x 120</div>
            </div>

            <div className="header-container">
                <h1 className="page-title">Select Your Table 🍻</h1>
                <p className="page-subtitle">หาโต๊ะที่ใช่ ในบรรยากาศที่ชอบ</p>
            </div>

            {/* 🔍 Search & Control Area */}
            <div className="search-room-area">
                <div className="search-board">
                    <span className="search-label">ค้นหาเลขโต๊ะ:</span>
                    <form className="search-form" onSubmit={handleSearchRoom}>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="เลขห้อง 4 หลัก..."
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                        />
                        <button type="submit" className="search-btn">Go!</button>
                    </form>
                </div>
            </div>

            {/* 📋 รายการห้อง (List View) */}
            <div className="room-cards-list">

                {/* ห้องที่ 1 */}
                <div className="room-item-row moograta-theme">
                    <div className="room-card-inner">
                        <div className="room-content-flex">
                            <div className="room-main-info">
                                <span className="room-icon">🥓</span>
                                <div className="text-group">
                                    <h2 className="room-name">ห้องหมูกระทะ (ID: 1001)</h2>
                                    <p className="room-desc">ปิ้งย่างร้อนๆ เคล้าเสียงคลื่น</p>
                                </div>
                            </div>
                            <div className="room-status-group">
                                <div className="detail-item">👥 9/12</div>
                                <div className="badge public">Public</div>
                            </div>
                            <button className="join-btn-small">Join</button>
                        </div>
                    </div>
                </div>

                {/* ห้องที่ 2 */}
                <div className="room-item-row cafe-theme">
                    <div className="room-card-inner">
                        <div className="room-content-flex">
                            <div className="room-main-info">
                                <span className="room-icon">☕</span>
                                <div className="text-group">
                                    <h2 className="room-name">ห้องคาเฟ่ (ID: 2002)</h2>
                                    <p className="room-desc">จิบกาแฟ ดูพระอาทิตย์ตกดิน</p>
                                </div>
                            </div>
                            <div className="room-status-group">
                                <div className="detail-item">👥 3/8</div>
                                <div className="badge private">Private</div>
                            </div>
                            <button className="join-btn-small">Join</button>
                        </div>
                    </div>
                </div>

            </div>

            {/* ⚓ Bottom Navigation Bar - New Design */}
            <BottomBar />
        </div>
    );
}

export default Hub;