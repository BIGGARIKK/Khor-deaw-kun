import React, { useEffect } from 'react';
import panImage from '../../assets/Mookata/pan.png';

function MookataPan({ itemsOnPan, setItemsOnPan, selectedIngredient, currentRotation, currentFlip, players, socket, roomId }) {

    // (ดึงชื่อตัวเองมาเช็คว่าจานไหนเป็นของเรา)
    const myName = localStorage.getItem('username') || 'Guest';

    // ==========================================
    // 👂 1. ดักฟังความเคลื่อนไหวจากเพื่อนในห้อง!
    // ==========================================
    useEffect(() => {
        if (!socket) return;

        socket.on('meat_added', (newItem) => {
            setItemsOnPan(prev => {
                if (prev.find(item => item.uniqueId === newItem.uniqueId)) return prev;
                return [...prev, newItem];
            });
        });

        socket.on('meat_moved', (data) => {
            setItemsOnPan(prev => prev.map(item =>
                item.uniqueId === data.uniqueId ? { ...item, x: data.x, y: data.y } : item
            ));
        });

        socket.on('meat_flipped', (data) => {
            setItemsOnPan(prev => prev.map(item => {
                if (item.uniqueId === data.uniqueId) {
                    return { ...item, activeSide: item.activeSide === 'A' ? 'B' : 'A', flip: (item.flip || 1) * -1 };
                }
                return item;
            }));
        });

        socket.on('meat_removed', (data) => {
            setItemsOnPan(prev => prev.filter(item => item.uniqueId !== data.uniqueId));
        });

        return () => {
            socket.off('meat_added');
            socket.off('meat_moved');
            socket.off('meat_flipped');
            socket.off('meat_removed');
        };
    }, [socket, setItemsOnPan]);

    // ==========================================
    // 🕰️ ระบบจับเวลาสุก/ไหม้
    // ==========================================
    useEffect(() => {
        if (!socket) return;
        socket.on('server_tick', () => {
            setItemsOnPan(prevItems => {
                if (prevItems.length === 0) return prevItems;
                return prevItems.map(item => {
                    let newSideA = item.sideA;
                    let newSideB = item.sideB;

                    if (item.activeSide === 'A') newSideA += 1;
                    else newSideB += 1;

                    let newStatus = 'raw';
                    if (newSideA > 10 || newSideB > 10) newStatus = 'burnt';
                    else if (newSideA >= 4 && newSideB >= 4) newStatus = 'cooked';
                    else if (newSideA >= 1 || newSideB >= 1) newStatus = 'cooking';

                    return { ...item, sideA: newSideA, sideB: newSideB, status: newStatus };
                });
            });
        });

        return () => socket.off('server_tick');
    }, [socket, setItemsOnPan]);

    // ==========================================
    // 🔄 2. พลิกหมู / ขยับหมู / วางหมู
    // ==========================================
    const handleFlipItemOnPan = (e, item) => {
        e.stopPropagation();
        if (socket) {
            socket.emit('flip_meat', { uniqueId: item.uniqueId, room_id: roomId });
        }
        setItemsOnPan(prevItems => prevItems.map(i => {
            if (i.uniqueId === item.uniqueId) {
                return { ...i, activeSide: i.activeSide === 'A' ? 'B' : 'A', flip: (i.flip || 1) * -1 };
            }
            return i;
        }));
    };

    const handleDragStartPanItem = (e, item) => {
        e.dataTransfer.setData('application/json', JSON.stringify({
            source: 'pan', uniqueId: item.uniqueId, status: item.status
        }));
    };

    const handleDragOver = (e) => e.preventDefault();

    const isInsidePanArea = (x, y, containerWidth, containerHeight) => {
        const centerX = containerWidth / 2;
        const centerY = containerHeight / 2;
        const radius = 280;
        const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        return distance <= radius;
    };

    const handleDropOnPan = (e) => {
        e.preventDefault();
        const dataString = e.dataTransfer.getData('application/json');
        if (!dataString) return;

        const droppedData = JSON.parse(dataString);
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (!isInsidePanArea(x, y, rect.width, rect.height)) return;

        if (droppedData.source === 'pan') {
            if (socket) {
                socket.emit('move_meat', { uniqueId: droppedData.uniqueId, x, y, room_id: roomId });
            }
            setItemsOnPan(prev => prev.map(item =>
                item.uniqueId === droppedData.uniqueId ? { ...item, x, y } : item
            ));
        } else {
            const newItem = {
                ...droppedData,
                uniqueId: `meat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                x, y,
                sideA: 0, sideB: 0, activeSide: 'A', status: 'raw',
                room_id: roomId
            };
            if (socket) socket.emit('add_meat', newItem);
            setItemsOnPan([...itemsOnPan, newItem]);
        }
    };

    const handleDropIngredientClick = (e) => {
        if (!selectedIngredient) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (!isInsidePanArea(x, y, rect.width, rect.height)) return;

        const newItem = {
            ...selectedIngredient,
            uniqueId: `meat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            x, y,
            rotation: currentRotation,
            flip: currentFlip,
            sideA: 0, sideB: 0, activeSide: 'A', status: 'raw',
            room_id: roomId
        };

        if (socket) socket.emit('add_meat', newItem);
        setItemsOnPan([...itemsOnPan, newItem]);
    };

    // ==========================================
    // 🎯 4. คีบกิน/ป้อนเพื่อน ลงจาน!
    // ==========================================
    const handleDropToPlayer = (e, targetPlayerName) => {
        e.preventDefault();
        const dataString = e.dataTransfer.getData('application/json');
        if (!dataString) return;

        const data = JSON.parse(dataString);

        if (data.source === 'pan') {
            // 🌟 คำนวณคะแนนตามความสุก
            let pointChange = 0;
            if (data.status === 'cooked') pointChange = 100; // สุกพอดี อร่อย!
            else if (data.status === 'burnt') pointChange = -50; // ไหม้! โดนตัดแต้ม
            else pointChange = -10; // ดิบ! ท้องเสีย โดนหักแต้ม

            if (socket) {
                socket.emit('feed_friend', {
                    targetId: targetPlayerName,
                    pointChange: pointChange,
                    room_id: roomId
                });

                socket.emit('remove_meat', {
                    uniqueId: data.uniqueId,
                    room_id: roomId
                });
            }

            setItemsOnPan(prev => prev.filter(i => i.uniqueId !== data.uniqueId));
        }
    };

    return (
        <div className="pan-container">
            <div
                className="mookata-pan-area"
                onClick={handleDropIngredientClick}
                onDragOver={handleDragOver}
                onDrop={handleDropOnPan}
            >
                <img src={panImage} alt="เตาหมูกระทะ" className="pan-actual-img" />

                {itemsOnPan.map((item) => {
                    const activeTime = item.activeSide === 'A' ? item.sideA : item.sideB;
                    const timeToBurn = 11 - activeTime;
                    const cookedPercent = Math.min(100, Math.floor(((Math.min(item.sideA, 4) + Math.min(item.sideB, 4)) / 8) * 100));

                    return (
                        <div
                            key={item.uniqueId}
                            className="item-on-pan"
                            style={{ position: 'absolute', left: `${item.x}px`, top: `${item.y}px` }}
                            onClick={(e) => handleFlipItemOnPan(e, item)}
                        >
                            <div className="meat-status-badge">
                                {item.status === 'burnt' ? (
                                    <div className="status-text burnt">💀 ไหม้เกรียม!</div>
                                ) : (
                                    <>
                                        <div className="status-text">สุก {cookedPercent}%</div>
                                        <div className="progress-mini">
                                            <div
                                                className="progress-fill"
                                                style={{ width: `${cookedPercent}%`, backgroundColor: cookedPercent === 100 ? '#84E045' : '#F48C2A' }}
                                            ></div>
                                        </div>
                                    </>
                                )}
                                {item.status !== 'burnt' && timeToBurn <= 3 && timeToBurn > 0 && (
                                    <div className="status-text warning">🔥 อีก {timeToBurn} วิไหม้!</div>
                                )}
                            </div>

                            <img
                                src={item.image} alt={item.name}
                                className={`item-pan-img ${item.status}`}
                                draggable="true"
                                onDragStart={(e) => handleDragStartPanItem(e, item)}
                                style={{ transform: `rotate(${item.rotation || 0}deg) scaleX(${item.flip || 1})` }}
                            />
                        </div>
                    );
                })}
            </div>

            {/* 🌟 โซนจานข้าวของเพื่อนแต่ละคน (ดึงจาก players) */}
            {/* 🌟 โซนจานข้าวของเพื่อนแต่ละคน */}
            <div className="players-action-board">
                {players.map((playerObj, index) => {
                    // 🌟 ดึงค่าจาก Object ที่ Server ส่งมา
                    const playerName = playerObj.username;
                    const playerImg = playerObj.profile_image;
                    const isMe = playerName === myName;

                    return (
                        <div
                            key={index}
                            className={`player-plate-zone ${isMe ? 'is-me' : ''}`}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDropToPlayer(e, playerName)}
                        >
                            {/* 🌟 เช็คว่ามีรูปไหม ถ้ามีโชว์รูป ถ้าไม่มีโชว์รูปหุ่นจำลอง */}
                            {playerImg ? (
                                <img
                                    src={`../../assets/avatar/${playerImg}`}
                                    alt={playerName}
                                    className="plate-profile-img"
                                    onError={(e) => {
                                        // 🌟 กันเหนียว เผื่อไฟล์รูปหาย ให้ขึ้นรูปนี้แทน
                                        e.target.onerror = null;
                                        e.target.src = 'https://ui-avatars.com/api/?name=' + playerName + '&background=random';
                                    }}
                                />
                            ) : (
                                <div className="plate-icon">{isMe ? '😋' : '🍽️'}</div>
                            )}

                            <div className="plate-owner-name">{playerName}</div>
                            {isMe && <div className="plate-tag">จานของคุณ</div>}
                        </div>
                    );
                })}
            </div>

            <div className="pan-controls-mini">
                <button onClick={() => {
                    setItemsOnPan([]);
                }}>🧽 ล้างเตา</button>
            </div>
        </div>
    );
}

export default MookataPan;