import React, { useState, useEffect } from 'react';
import IngredientMenu from './IngredientMenu';
import MookataPan from './MookataPan';
import RoomChat from './RoomChat';
import './GrillRoom.css';

function GrillRoom() {
    const [itemsOnPan, setItemsOnPan] = useState([]);
    const [selectedIngredient, setSelectedIngredient] = useState(null);
    const [currentRotation, setCurrentRotation] = useState(0);
    const [currentFlip, setCurrentFlip] = useState(1);
    
    // 🌟 1. สร้างรายชื่อคนในห้อง (เอาไว้เป็นเป้าหมายในการป้อนหมู!)
    const [players, setPlayers] = useState([
        { id: 'p1', name: 'ฉันเอง (Me)', isMe: true, avatar: '😎', score: 0 },
        { id: 'p2', name: 'Coconut_Kun', isMe: false, avatar: '🥥', score: 0 },
        { id: 'p3', name: 'Peter', isMe: false, avatar: '🤖', score: 0 },
        { id: 'p4', name: 'Mali', isMe: false, avatar: '🌸', score: 0 },
        { id: 'p5', name: 'InwZa007', isMe: false, avatar: '🔥', score: 0 }
    ]);

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

    return (
        <div className="grill-room-container">
            <div className="room-header">
                <h2>🏖️ chill chill tee Moo Tha</h2>
                {/* เอา Scoreboard เดิมออก เพราะคะแนนจะไปโชว์ที่โปรไฟล์แต่ละคนแทน */}
                <button className="leave-room-btn">🚪 กลับหน้า Feed</button>
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
                    players={players} // 🌟 2. ส่งรายชื่อเพื่อนไปที่กระทะ
                    setPlayers={setPlayers} // 🌟 3. ส่งฟังก์ชันอัปเดตคะแนนเพื่อนไป
                />

                <RoomChat />
            </div>
        </div>
    );
}

export default GrillRoom;