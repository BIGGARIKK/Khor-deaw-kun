import React, { useState, useEffect, useRef } from 'react';
import IngredientMenu from './IngredientMenu';
import { io } from 'socket.io-client'; //
import MookataPan from './MookataPan';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import RoomChat from './RoomChat';
import './GrillRoom.css';
import YouTubeJukebox from './YouTubeJukebox'; // 🌟 นำเข้าตู้เพลง
function GrillRoom() {
    const navigate = useNavigate();
    const socketRef = useRef(null);
    const [itemsOnPan, setItemsOnPan] = useState([]);
    const [selectedIngredient, setSelectedIngredient] = useState(null);
    const [currentRotation, setCurrentRotation] = useState(0);
    const [currentFlip, setCurrentFlip] = useState(1);

    // 🌟 1. สร้างรายชื่อคนในห้อง (เอาไว้เป็นเป้าหมายในการป้อนหมู!)
    const [players, setPlayers] = useState([]);

    const { roomId } = useParams();

    // ✅ สร้าง socket ใน useEffect เพื่อให้ component พร้อมแล้ว
    useEffect(() => {
        socketRef.current = io('https://probable-goldfish-4jvvgxxvpxxcqqpg-5000.app.github.dev/');
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    useEffect(() => {
        if (!socketRef.current) return;

        // 👂 ฟังคำสั่งอัปเดตรายชื่อจาก Server
        socketRef.current.on('update_player_list', (playerList) => {
            console.log("👥 สมาชิกในโต๊ะปัจจุบัน:", playerList);
            setPlayers(playerList);
        });

        return () => socketRef.current.off('update_player_list');
    }, []);

    useEffect(() => {
        if (!socketRef.current) return;
        const myProfileImg = localStorage.getItem('profile_image') || '';

        // 🌟 2. เมื่อเข้าหน้าห้องแล้ว ให้ส่งคำขอจองโต๊ะไปที่ Server ทันที
        socketRef.current.emit('join_game_room', {
            room_id: roomId,
            username: localStorage.getItem('username'),
            profile_image: myProfileImg
        });

        // ✅ ฟัง chat history
        socketRef.current.on('load_chat_history', (chatHistory) => {
            console.log("💬 โหลดประวัติแชท:", chatHistory);
        });

        // ✅ ฟัง chat messages ในห้อง
        socketRef.current.on('chat_message', (message) => {
            console.log("💬 มีข้อความใหม่:", message);
        });

    }, [roomId]);

    useEffect(() => {
        if (!socketRef.current) return;

        socketRef.current.on('score_updated', (data) => {
            // อัปเดตคะแนนให้คนโดนป้อน
            setPlayers(prevPlayers => prevPlayers.map(p => {
                // 🌟 แก้ตรงนี้: เปลี่ยนจาก p.id เป็น p.username
                if (p.username === data.targetId) {
                    return { ...p, score: (p.score || 0) + data.pointChange };
                }
                return p;
            }));
        });

        return () => socketRef.current.off('score_updated');
    }, []);

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
        if (socketRef.current) {
            socketRef.current.emit('leave_game_room', { room_id: roomId });
        }
        // ฉีกกระดาษเลขห้องทิ้ง เพราะไม่ได้อยู่โต๊ะนี้แล้ว
        localStorage.removeItem('active_room');
        
        navigate('/Hub');
    };

    const handleMinimizeRoom = () => {
        // จดเลขห้องลงสมุดพกก่อนไปหน้า Hub
        localStorage.setItem('active_room', roomId);
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
                        onClick={handleMinimizeRoom}
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
                    socket={socketRef.current}
                    roomId={roomId}
                />

               {/* 🌟 สร้างกล่องหุ้มด้านขวา เพื่อใส่ตู้เพลงและแชทไว้ด้วยกัน */}
                <div className="right-panel-wrapper">
                    
                    {/* 🎵 ตู้เพลง */}
                    <YouTubeJukebox 
                        socket={socketRef.current} 
                        roomId={roomId} 
                        myName={localStorage.getItem('username')} 
                    />

                    {/* 💬 กล่องแชท (ของเดิม) */}
                    <RoomChat
                        socket={socketRef.current}
                        roomId={roomId}
                        players={players}
                    />
                </div>
            </div>
        </div>
    );
}

export default GrillRoom;