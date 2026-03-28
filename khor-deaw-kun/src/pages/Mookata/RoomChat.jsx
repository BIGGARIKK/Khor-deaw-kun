import React, { useState, useEffect, useRef } from 'react';
import './GrillRoom.css'; // เผื่อคุณเก็บ CSS ไว้รวมกัน

// 🌟 รับ players เพิ่มเข้ามาจาก Props
function RoomChat({ socket, roomId, players }) { 
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    
    // 🌟 State สำหรับคุมแท็บ (ค่าเริ่มต้นเป็น 'chat')
    const [activeTab, setActiveTab] = useState('chat'); // 'chat' หรือ 'members'
    
    const chatEndRef = useRef(null);
    const myName = localStorage.getItem('username') || 'Guest';

    useEffect(() => {
        if (!socket) return;
        socket.on('chat_message', (data) => {
            setMessages((prev) => [...prev, data]);
        });
        return () => socket.off('chat_message');
    }, [socket]);

    useEffect(() => {
        if (activeTab === 'chat') {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, activeTab]);

    const handleSendMessage = (e) => {
        e.preventDefault(); 
        if (!inputText.trim() || !socket || !roomId) return; 

        const newMsg = {
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2,9)}`, 
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
            {/* 🌟 1. เนื้อหาของแท็บแชท */}
{activeTab === 'chat' && (
    <>
        <div className="chat-messages">
            {messages.map((msg) => {
                // 1. ถ้าเป็นข้อความระบบ (เช่น คนเข้าห้อง) ให้อยู่ตรงกลาง
                if (msg.type === 'system') {
                    return <div key={msg.id} className="chat-bubble system">{msg.text}</div>;
                }

                // 2. เช็คว่าข้อความนี้ "เรา" เป็นคนส่งใช่ไหม?
                const isMe = msg.sender === myName;

                return (
                    <div key={msg.id} className={`chat-wrapper ${isMe ? 'is-me' : 'is-other'}`}>
                        {/* โชว์ชื่อคนส่ง (ถ้าเป็นเราให้เขียนว่า 'คุณ') */}
                        <div className="chat-sender">{isMe ? 'คุณ' : msg.sender}</div>
                        
                        {/* ตัวกล่องข้อความ */}
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
           {/* 🌟 2. เนื้อหาของแท็บรายชื่อคน */}
            {activeTab === 'members' && (
                <div className="members-list-area">
                    <div className="members-instruction">รายชื่อผู้ถือตะเกียบร่วมโต๊ะ</div>
                    <div className="player-badges-list">
                        {players.map((p, index) => {
                            const pName = p.username; // ดึงชื่อออกมา
                            const pImg = p.profile_image; // ดึงรูปออกมา
                            
                            return (
                                <div key={index} className={`member-card ${pName === myName ? 'is-me' : ''}`}>
                                    {pImg ? (
                                        <img src={pImg} className="member-avatar" style={{objectFit: 'cover'}} alt="avatar" />
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