import React, { useState, useEffect, useRef } from 'react';
import './GrillRoom.css'; 

function RoomChat({ socket, roomId, players }) {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');

    const [activeTab, setActiveTab] = useState('chat'); 

    const chatEndRef = useRef(null);
    const myName = localStorage.getItem('username') || 'Guest';

    // ==========================================
    // 👂 ดักฟังข้อความใหม่ และ โหลดประวัติเก่า จาก Server
    // ==========================================
    // ==========================================
    // 👂 ดักฟังข้อความใหม่ และ โหลดประวัติเก่า จาก Server
    useEffect(() => {
        if (!socket) return;

        // ฟังก์ชันดักฟังแชทใหม่
        const handleChatMessage = (msg) => {
            setMessages((prev) => {
                // เช็คกันบั๊กข้อความซ้ำ (เผื่อ Server ส่งมาซ้อน)
                if (prev.some(m => m.id === msg.id)) return prev;
                return [...prev, msg];
            });
        };

        // ฟังก์ชันโหลดประวัติเก่า
        const handleLoadHistory = (history) => {
            console.log("📜 ประวัติแชทมาถึงแล้ว:", history);
            if (history && history.length > 0) {
                setMessages(history);
            }
        };

        socket.on('chat_message', handleChatMessage);
        socket.on('load_chat_history', handleLoadHistory);

        // 🌟 พิเศษ: ส่งสัญญาณบอก Server ว่า "ฉันพร้อมรับแชทแล้วนะ!"
        // (ถ้า Server มีระบบหน่วงเวลาอยู่แล้ว ตัวนี้จะเป็นตัวช่วยยืนยันอีกแรง)
        socket.emit('request_chat_sync', { room_id: roomId });

        return () => {
            socket.off('chat_message', handleChatMessage);
            socket.off('load_chat_history', handleLoadHistory);
        };
    }, [socket, roomId]);
    // 🌟 เลื่อนจอลงล่างสุดอัตโนมัติเวลาแชทอัปเดต
    useEffect(() => {
        if (activeTab === 'chat') {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, activeTab]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputText.trim() || !socket || !roomId) return;

        const newMsg = {
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'user',
            sender: myName,
            text: inputText.trim(),
            room_id: roomId
        };

        socket.emit('send_message', newMsg);
        setInputText('');
    };

    return (
        <div className="room-chat-container">
            {/* 🌟 ส่วนสลับแท็บ (Tab Navigation) */}
            <div className="chat-tabs">
                <button
                    className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
                    onClick={() => setActiveTab('chat')}
                >
                    💬 แชทบีช
                </button>
                <button
                    className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`}
                    onClick={() => setActiveTab('members')}
                >
                    👥 ในห้อง ({players.length})
                </button>
            </div>

            {/* 🌟 1. เนื้อหาของแท็บแชท */}
            {activeTab === 'chat' && (
                <>
                    <div className="chat-messages">
                        {messages.map((msg) => {
                            if (msg.type === 'system') {
                                return <div key={msg.id} className="chat-bubble system">{msg.text}</div>;
                            }

                            const isMe = msg.sender === myName;

                            return (
                                <div key={msg.id} className={`chat-wrapper ${isMe ? 'is-me' : 'is-other'}`}>
                                    <div className="chat-sender">{isMe ? 'คุณ' : msg.sender}</div>
                                    <div className="chat-bubble user">
                                        {msg.text}
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={chatEndRef} />
                    </div>

                    <form className="chat-input-area" onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            placeholder="แซวเพื่อนหน่อย..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                        />
                        <button type="submit">Send</button>
                    </form>
                </>
            )}

            {/* 🌟 2. เนื้อหาของแท็บรายชื่อคน */}
            {activeTab === 'members' && (
                <div className="members-list-area">
                    <div className="members-instruction">รายชื่อผู้ถือตะเกียบร่วมโต๊ะ</div>
                    <div className="player-badges-list">
                        {players.map((p, index) => {
                            const pName = p.username; 
                            const pImg = p.profile_image; 

                            return (
                                <div key={index} className={`member-card ${pName === myName ? 'is-me' : ''}`}>
                                    {pImg ? (
                                        <img src={`/avatars/${pImg}`} className="member-avatar" style={{ objectFit: 'cover' }} alt="avatar" />
                                    ) : (
                                        <div className="member-avatar">{pName.charAt(0).toUpperCase()}</div>
                                    )}
                                    <div className="member-info">
                                        <span className="member-name">{pName} {pName === myName && '(คุณ)'}</span>
                                        <span className="member-status">🟢 กำลังปิ้ง</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

export default RoomChat;