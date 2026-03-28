import React, { useState, useEffect, useRef } from 'react';
import './GrillRoom.css'; 

function RoomChat({ socket, roomId, players }) {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [activeTab, setActiveTab] = useState('chat'); 
    
    // 🌟 State สำหรับเก็บข้อมูลตอนมีคนกดชนแก้ว
    const [cheersEvent, setCheersEvent] = useState(null);

    const chatEndRef = useRef(null);
    const myName = localStorage.getItem('username') || 'Guest';

    // ==========================================
    // 👂 ดักฟังข้อความใหม่, โหลดประวัติเก่า, และแอนิเมชันชนแก้ว
    // ==========================================
    useEffect(() => {
        if (!socket) return;

        // ฟังก์ชันดักฟังแชทใหม่
        const handleChatMessage = (msg) => {
            setMessages((prev) => {
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

        // 🌟 ฟังก์ชันดักฟังแอนิเมชันชนแก้ว
        const handleReceiveCheers = (data) => {
            setCheersEvent(data); // เอาข้อความขึ้นโชว์กลางจอ
            // ตั้งเวลาให้แอนิเมชันหายไปเองใน 2.5 วินาที
            setTimeout(() => {
                setCheersEvent(null);
            }, 2500);
        };

        socket.on('chat_message', handleChatMessage);
        socket.on('load_chat_history', handleLoadHistory);
        socket.on('receive_cheers', handleReceiveCheers);

        socket.emit('request_chat_sync', { room_id: roomId });
        
        return () => {
            socket.off('chat_message', handleChatMessage);
            socket.off('load_chat_history', handleLoadHistory);
            socket.off('receive_cheers', handleReceiveCheers);
        };
    }, [socket, roomId]);

    // 🌟 เลื่อนจอลงล่างสุดอัตโนมัติเวลาแชทอัปเดต
    useEffect(() => {
        if (activeTab === 'chat') {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, activeTab]);

    // ฟังก์ชันส่งข้อความ
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

    // 🌟 ฟังก์ชันส่งคำขอชนแก้ว
    const handleSendCheers = (targetName) => {
    if (!socket || !roomId) return;
    
    // 1. ยิง Socket ไปบอก Server (เพื่อให้แอนิเมชันเด้ง)
    socket.emit('send_cheers', {
        room_id: roomId,
        sender: myName,
        target: targetName
    });

    // 🌟 2. อัปเดตตัวเลขเควสต์ในเครื่องเราเอง (Sidebar จะได้อัปเดต)
    const currentCount = parseInt(localStorage.getItem('quest_cheers_count') || '0');
    const newCount = currentCount + 1;
    localStorage.setItem('quest_cheers_count', newCount.toString());

    // 🌟 3. ตะโกนบอก Sidebar ให้โหลดข้อมูลใหม่ (ยิง Event "quest_updated")
    window.dispatchEvent(new Event('quest_updated'));
};
    return (
        <div className="room-chat-container">
            
            {/* 🌟 ป๊อปอัปแอนิเมชันชนแก้ว (จะโผล่มาทับกลางจอเมื่อมีคนกด) */}
            {cheersEvent && (
                <div className="cheers-overlay">
                    <div className="cheers-emojis">🍻</div>
                    <div className="cheers-text">{cheersEvent.message}</div>
                </div>
            )}

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
                                    
                                    <div className="noti-avatar-container" style={{ flexShrink: 0, marginRight: '12px' }}>
                                        {pImg ? (
                                            <img src={`/assets/avatars/${pImg}`} className="member-avatar" style={{ objectFit: 'cover' }} alt="avatar" 
                                                onError={(e) => {
                                                    e.target.onerror = null; 
                                                    e.target.src = `https://ui-avatars.com/api/?name=${pName}&background=random`;
                                                }}
                                            />
                                        ) : (
                                            <div className="member-avatar">{pName.charAt(0).toUpperCase()}</div>
                                        )}
                                    </div>

                                    {/* 🌟 ปรับตรงนี้เพื่อใส่ปุ่มชนแก้วทางขวามือ */}
                                    <div className="member-info" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span className="member-name">{pName} {pName === myName && '(คุณ)'}</span>
                                            <span className="member-status">🟢 กำลังปิ้ง</span>
                                        </div>
                                        
                                        {/* โชว์ปุ่มชนแก้วเฉพาะที่ไม่ใช่ตัวเอง */}
                                        {pName !== myName && (
                                            <button 
                                                className="cheers-btn"
                                                onClick={() => handleSendCheers(pName)}
                                            >
                                                🍻 ชนแก้ว!
                                            </button>
                                        )}
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