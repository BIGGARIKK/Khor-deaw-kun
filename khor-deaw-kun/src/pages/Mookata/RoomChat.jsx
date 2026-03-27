import React, { useState } from 'react';

function RoomChat() {
    const [messages, setMessages] = useState([
        { id: 1, sender: 'System', text: 'BIGGARIKK joined the room 🍻', type: 'system' },
        { id: 2, sender: 'Coconut_Kun', text: 'ใครเอาหมูลงยัง หิวแล้ววว', type: 'user' }
    ]);
    const [inputText, setInputText] = useState("");

    const handleSendMessage = () => {
        if (!inputText.trim()) return;
        
        const newMsg = {
            id: Date.now(),
            sender: 'BIGGARIKK', // ดึงจาก currentUser จริงๆ มาใส่
            text: inputText,
            type: 'user'
        };
        
        setMessages([...messages, newMsg]);
        setInputText("");
    };

    return ( 
        <div className="room-chat-container">
            <div className="chat-header">
                <h3>💬 Chat</h3>
            </div>
            
            <div className="chat-messages">
                {messages.map((msg) => (
                    <div key={msg.id} className={`chat-bubble ${msg.type}`}>
                        {msg.type === 'user' && <strong>{msg.sender}: </strong>}
                        <span>{msg.text}</span>
                    </div>
                ))}
            </div>

            <div className="chat-input-area">
                <input 
                    type="text" 
                    placeholder="แซวเพื่อนหน่อย..." 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button onClick={handleSendMessage}>Send</button>
            </div>
        </div>
    );
}

export default RoomChat;