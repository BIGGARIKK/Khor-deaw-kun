import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomBar from '../Feed/component/feed/BottomBar';
import './Hub.css';

function Hub() {
    const navigate = useNavigate();
    const [searchId, setSearchId] = useState('');
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    const currentUser = localStorage.getItem('username') || 'Guest';
    const token = localStorage.getItem('access_token'); 

    // ==========================================
    // 🌟 State สำหรับจัดการ Popup สร้างห้อง
    // ==========================================
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newRoomName, setNewRoomName] = useState(`${currentUser}'s Table`);
    const [newMaxPlayers, setNewMaxPlayers] = useState(6);
    const [newIsPrivate, setNewIsPrivate] = useState(false);
    const [newPassword, setNewPassword] = useState('');

    // ==========================================
    // 🔄 ดึงข้อมูลห้องทั้งหมดจาก Backend (ฉบับแก้ 401)
    // ==========================================
    useEffect(() => {
        const fetchRooms = async () => {
            // 🌟 1. ดึงกล่อง user มาแกะเอา Token ออกมา
            const userString = localStorage.getItem('user');
            let currentToken = null;

            if (userString) {
                try {
                    const userData = JSON.parse(userString);
                    currentToken = userData.access_token;
                } catch (e) {
                    console.error("JSON Parse error", e);
                }
            }

            // 🚨 2. ถ้าไม่มี Token จริงๆ ให้เตะกลับไป Login
            if (!currentToken) {
                console.warn("No token found, redirecting...");
                navigate('/signin');
                return;
            }

            try {
                const response = await fetch('http://localhost:5000/rooms', {
                    headers: { 
                        // 🌟 3. ใช้ currentToken ที่แกะได้ส่งไป
                        'Authorization': `Bearer ${currentToken}` 
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setRooms(data);
                } else if (response.status === 401) {
                    // ถ้า Token หมดอายุ หรือพัง ให้เตะออก
                    navigate('/signin');
                }
            } catch (error) {
                console.error("Error connecting to server:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, [navigate]); // 🌟 เอา token ออกจาก dependency เพราะเราดึงสดข้างในแล้ว

    const handleSearchRoom = (e) => {
        e.preventDefault();
        if (!searchId) return;
        const foundRoom = rooms.find(r => r.room_id === searchId);
        if (foundRoom) {
            handleJoinRoom(foundRoom);
        } else {
            alert("❌ ไม่พบเลขโต๊ะนี้ในระบบครับ!");
        }
    };

    // ==========================================
    // 🚪 ระบบเข้าห้อง (Join Room) - ฉบับแก้ไข Token
    // ==========================================
    const handleJoinRoom = async (room) => {
        // 🌟 1. ดึงและแกะห่อ Token เหมือนตอนสร้างห้องเป๊ะๆ
        const userString = localStorage.getItem('user');
        let currentToken = null;

        if (userString) {
            try {
                const userData = JSON.parse(userString);
                currentToken = userData.access_token;
            } catch (e) {
                console.error("Parse error", e);
            }
        }

        // 🚨 ถ้าไม่มี Token ให้เตะออกไป Login
        if (!currentToken) {
            alert("กรุณาล็อกอินใหม่ครับ เซสชันหมดอายุ 🍻");
            navigate('/signin');
            return;
        }

        let password = '';
        if (room.status === 'private') {
            password = prompt(`โต๊ะนี้เป็นโต๊ะส่วนตัว (Private)\nกรุณากรอกรหัสผ่านสำหรับห้อง ${room.room_name}:`);
            if (password === null) return; 
        }

        try {
            const response = await fetch('http://localhost:5000/join-room', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 🌟 2. ใช้ currentToken ที่แกะมาแล้วส่งไป
                    'Authorization': `Bearer ${currentToken}`
                },
                body: JSON.stringify({ room_id: room.room_id, password: password })
            });

            const data = await response.json();

            if (response.ok) {
                navigate(`/room/${room.room_id}`); 
            } else {
                alert(`❌ เข้าห้องไม่ได้: ${data.message}`);
            }
        } catch (error) {
            alert("❌ ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
        }
    };

    // ==========================================
    // 🛠️ ฟังก์ชันยืนยันการสร้างห้อง (ส่งไปหา Backend)
    // ==========================================
    const submitCreateRoom = async () => {
        // 🌟 1. ดึงข้อมูลจาก localStorage
        const userString = localStorage.getItem('user');
        
        // 🌟 2. ใช้ let แทน const เพราะเราต้องเปลี่ยนค่าจาก null เป็นข้อมูลจริง
        let currentToken = null; 

        if (userString) {
            try {
                // แกะห่อ JSON
                const userData = JSON.parse(userString);
                // จิ้มเอา access_token ออกมา
                currentToken = userData.access_token;
            } catch (e) {
                console.error("Parse JSON error", e);
            }
        }

        // ลองปริ้นท์เช็คดู
        console.log("👉 Token ที่ดึงมาได้:", currentToken);

        // 🚨 ด่านสกัด: ถ้าไม่มี Token ให้เตะออก
        if (!currentToken || currentToken === 'null' || currentToken === 'undefined') {
            alert("คุณยังไม่ได้ล็อกอิน หรือเซสชันหมดอายุ! กรุณาล็อกอินใหม่ครับ 🍻");
            navigate('/signin'); 
            return;
        }

        // เช็คชื่อห้อง
        if (!newRoomName.trim()) {
            alert("กรุณาตั้งชื่อโต๊ะด้วยครับ!");
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/create-room', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 🌟 3. ใช้ตัวแปร currentToken ที่เราแกะห่อมาแล้ว
                    'Authorization': `Bearer ${currentToken}` 
                },
                body: JSON.stringify({
                    room_name: newRoomName,
                    max_players: newMaxPlayers,
                    status: newIsPrivate ? 'private' : 'public',
                    password: newPassword
                })
            });

            const data = await response.json();
            if (response.ok) {
                setShowCreateModal(false); 
                navigate(`/room/${data.room_id}`); 
            } else {
                alert("❌ สร้างห้องไม่สำเร็จ: " + (data.message || 'เกิดข้อผิดพลาด'));
            }
        } catch (error) {
            alert("❌ ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
        }
    };

    // ==========================================
    // 🧹 ฟังก์ชันเปิด Popup (พร้อม Reset ค่าเดิม)
    // ==========================================
    const openCreateModal = () => {
        setNewRoomName(`${currentUser}'s Table`);
        setNewMaxPlayers(6);
        setNewIsPrivate(false);
        setNewPassword('');
        setShowCreateModal(true);
    };

    return (
        <div className="room-selection-bg">
            <div className="user-profile-bar">
                <div className="user-info">
                    <div className="user-avatar">😎</div>
                    <span className="user-name">{currentUser}</span>
                </div>
                <div className="user-stats">🍻 x 120</div>
            </div>

            <div className="header-container">
                <h1 className="page-title">Select Your Table 🍻</h1>
                <p className="page-subtitle">หาโต๊ะที่ใช่ ในบรรยากาศที่ชอบ</p>
            </div>

            <div className="search-room-area">
                <div className="search-board">
                    <span className="search-label">ค้นหาเลขโต๊ะ:</span>
                    <form className="search-form" onSubmit={handleSearchRoom}>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="เลขห้อง (เช่น AB12CD)..."
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value.toUpperCase())}
                        />
                        <button type="submit" className="search-btn">Go!</button>
                    </form>
                    
                    {/* 🌟 เปลี่ยนปุ่มมาเรียกเปิด Popup แทน */}
                    <button onClick={openCreateModal} className="create-room-btn">
                        ➕ เปิดโต๊ะใหม่
                    </button>
                </div>
            </div>

            <div className="room-cards-list">
                {loading ? (
                    <div className="loading-text" style={{textAlign: 'center', marginTop: '50px'}}>กำลังจัดโต๊ะ... 🥩</div>
                ) : rooms.length === 0 ? (
                    <div className="empty-rooms" style={{textAlign: 'center', marginTop: '50px'}}>
                        <h3>ยังไม่มีใครเปิดโต๊ะเลย 🥲</h3>
                        <p>มากดเปิดโต๊ะใหม่เป็นคนแรกสิ!</p>
                    </div>
                ) : (
                    rooms.map((room) => (
                        <div key={room.room_id} className={`room-item-row ${room.status === 'private' ? 'cafe-theme' : 'moograta-theme'}`}>
                            <div className="room-card-inner">
                                <div className="room-content-flex">
                                    <div className="room-main-info">
                                        <span className="room-icon">{room.status === 'private' ? '🔒' : '🥓'}</span>
                                        <div className="text-group">
                                            <h2 className="room-name">{room.room_name} (ID: {room.room_id})</h2>
                                            <p className="room-desc">เปิดโดย: {room.host_username}</p>
                                        </div>
                                    </div>
                                    <div className="room-status-group">
                                        <div className="detail-item">👥 {room.players.length}/{room.max_players}</div>
                                        <div className={`badge ${room.status}`}>
                                            {room.status === 'private' ? 'Private' : 'Public'}
                                        </div>
                                    </div>
                                    <button 
                                        className="join-btn-small"
                                        onClick={() => handleJoinRoom(room)}
                                        disabled={room.players.length >= room.max_players}
                                    >
                                        {room.players.length >= room.max_players ? 'Full' : 'Join'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <BottomBar />

            {/* ==========================================
                🌟 MODAL (Popup เปิดโต๊ะใหม่)
                ========================================== */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h2>➕ สร้างโต๊ะหมูกระทะ</h2>
                        
                        <div className="form-group">
                            <label>ชื่อโต๊ะ:</label>
                            <input 
                                type="text" 
                                value={newRoomName} 
                                onChange={(e) => setNewRoomName(e.target.value)}
                                placeholder="ตั้งชื่อห้องเก๋ๆ..."
                            />
                        </div>

                        <div className="form-group">
                            <label>จำนวนที่นั่งสูงสุด:</label>
                            <select 
                                value={newMaxPlayers} 
                                onChange={(e) => setNewMaxPlayers(Number(e.target.value))}
                            >
                                <option value={2}>2 คน (มาเดต)</option>
                                <option value={4}>4 คน (แก๊งเพื่อน)</option>
                                <option value={6}>6 คน (ปาร์ตี้ใหญ่)</option>
                                <option value={8}>8 คน (เหมาโต๊ะ)</option>
                            </select>
                        </div>

                        <div className="form-group checkbox-group">
                            <label>
                                <input 
                                    type="checkbox" 
                                    checked={newIsPrivate} 
                                    onChange={(e) => setNewIsPrivate(e.target.checked)} 
                                />
                                🔒 ห้องส่วนตัว (Private)
                            </label>
                        </div>

                        {newIsPrivate && (
                            <div className="form-group">
                                <label>รหัสผ่านห้อง:</label>
                                <input 
                                    type="password" 
                                    value={newPassword} 
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="ใส่รหัสผ่าน..."
                                />
                            </div>
                        )}

                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={() => setShowCreateModal(false)}>ยกเลิก</button>
                            <button className="confirm-btn" onClick={submitCreateRoom}>เปิดโต๊ะเลย!</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Hub;