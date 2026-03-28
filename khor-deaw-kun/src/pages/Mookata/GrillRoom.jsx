import React, { useState, useEffect } from 'react';
import IngredientMenu from './IngredientMenu';
import { io } from 'socket.io-client'; //
import MookataPan from './MookataPan';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import RoomChat from './RoomChat';
import './GrillRoom.css';
const socket = io('http://localhost:5000');
function GrillRoom() {
    const navigate = useNavigate();
    const [itemsOnPan, setItemsOnPan] = useState([]);
    const [selectedIngredient, setSelectedIngredient] = useState(null);
    const [currentRotation, setCurrentRotation] = useState(0);
    const [currentFlip, setCurrentFlip] = useState(1);
    
    // 🌟 1. สร้างรายชื่อคนในห้อง (เอาไว้เป็นเป้าหมายในการป้อนหมู!)
    const [players, setPlayers] = useState([]);

    const { roomId } = useParams();

    useEffect(() => {
        if (!socket) return;

        // 👂 ฟังคำสั่งอัปเดตรายชื่อจาก Server
        socket.on('update_player_list', (playerList) => {
            console.log("👥 สมาชิกในโต๊ะปัจจุบัน:", playerList);
            setPlayers(playerList);
        });

        return () => socket.off('update_player_list');
    }, [socket]);

    useEffect(() => {
        if (!socket) return;
        const myProfileImg = localStorage.getItem('profile_image') || '';

        // 🌟 2. เมื่อเข้าหน้าห้องแล้ว ให้ส่งคำขอจองโต๊ะไปที่ Server ทันที
        // 🌟 3. ตะโกนบอก Server ทันทีที่เข้าหน้าหน้า: "ฉันขอจองโต๊ะเบอร์นี้!"
        socket.emit('join_game_room', { 
            room_id: roomId, 
            username: localStorage.getItem('username'),
            profile_image: myProfileImg
        });

        // ... (ฟังเหตุการณ์ Socket อื่นๆ เหมือนเดิม) ...
    }, [roomId]);

    useEffect(() => {
        if (!socket) return;
        
        socket.on('score_updated', (data) => {
            // อัปเดตคะแนนให้คนโดนป้อน
            setPlayers(prevPlayers => prevPlayers.map(p => {
                // 🌟 แก้ตรงนี้: เปลี่ยนจาก p.id เป็น p.username
                if (p.username === data.targetId) { 
                    return { ...p, score: (p.score || 0) + data.pointChange };
                }
                return p;
            }));
        });

        return () => socket.off('score_updated');
    }, [socket]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!selectedIngredient) return;
            if (e.key === 'r' || e.key === 'R') setCurrentRotation((prev) => prev + 45);
            if (e.key === 'f' || e.key === 'F') setCurrentFlip((prev) => prev * -1);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIngredient]);

    const handleSelectIngredient = (item) => {
        setSelectedIngredient(item);
        setCurrentRotation(0); 
        setCurrentFlip(1); 
    };

    const handleLeaveRoomCompletely = () => {
        if (socket) {
            // ส่งคำสั่งไปบอก Server ว่าเราขอออกนะ
            socket.emit('leave_game_room', { room_id: roomId });
        }
        // แล้วค่อยเด้งกลับหน้า Hub
        navigate('/Hub');
    };  

return (
        <div className="grill-room-container">
            <div className="room-header">
                <h2>🏖️ chill chill tee Moo Tha (โต๊ะ: {roomId})</h2>
                
                {/* 🌟 โซนปุ่มมุมขวาบนที่มี 2 ปุ่ม */}
                <div className="header-actions">
                    {/* ปุ่ม 1: พับจอ (จานยังอยู่บนโต๊ะ) */}
                    <button 
                        className="minimize-room-btn" 
                        onClick={() => navigate('/Hub')}
                    >
                        👀 แวะไปหน้า Feed
                    </button>
                    
                    {/* ปุ่ม 2: ลุกจากโต๊ะ (จานหายไปเลย) */}
                    <button 
                        className="leave-room-btn" 
                        onClick={handleLeaveRoomCompletely}
                    >
                        🚪 ลุกจากโต๊ะ
                    </button>
                </div>
            </div>

            <div className="room-content-wrapper">
                <IngredientMenu 
                    selectedIngredient={selectedIngredient} 
                    onSelectIngredient={handleSelectIngredient} 
                    currentRotation={currentRotation}
                    setCurrentRotation={setCurrentRotation}
                    currentFlip={currentFlip} 
                    setCurrentFlip={setCurrentFlip} 
                />

                <MookataPan 
                    itemsOnPan={itemsOnPan} 
                    setItemsOnPan={setItemsOnPan} 
                    selectedIngredient={selectedIngredient}
                    currentRotation={currentRotation}
                    currentFlip={currentFlip} 
                    players={players} 
                    socket={socket} 
                    roomId={roomId}
                />

                {/* 🌟 ส่ง players เข้าไปให้ RoomChat จัดการต่อ */}
                <RoomChat 
                    socket={socket} 
                    roomId={roomId}
                    players={players} 
                />
            </div>
        </div>
    );
}

export default GrillRoom;