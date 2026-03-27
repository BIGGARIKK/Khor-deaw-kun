import React, { useEffect } from 'react';
import panImage from '../../assets/Mookata/pan.png'; 

function MookataPan({ itemsOnPan, setItemsOnPan, selectedIngredient, currentRotation, currentFlip, players, setPlayers }) {
    
    // (ระบบจับเวลาสุก/ไหม้ เหมือนเดิม)
    useEffect(() => {
        const cookTimer = setInterval(() => {
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
        }, 1000);
        return () => clearInterval(cookTimer);
    }, [setItemsOnPan]);

    const handleFlipItemOnPan = (e, item) => {
        e.stopPropagation(); 
        setItemsOnPan(prevItems => prevItems.map(i => {
            if (i.uniqueId === item.uniqueId) {
                return { ...i, activeSide: i.activeSide === 'A' ? 'B' : 'A', flip: (i.flip || 1) * -1 };
            }
            return i;
        }));
    };

    const handleDragStartPanItem = (e, item) => {
        e.dataTransfer.setData('application/json', JSON.stringify({
            source: 'pan',
            uniqueId: item.uniqueId,
            status: item.status
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
            setItemsOnPan(prev => prev.map(item => 
                item.uniqueId === droppedData.uniqueId ? { ...item, x, y } : item
            ));
        } else {
            const newItem = {
                ...droppedData,
                uniqueId: Date.now(),
                x, y,
                sideA: 0, sideB: 0, activeSide: 'A', status: 'raw'
            };
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
            uniqueId: Date.now(),
            x: x,  y: y,
            rotation: currentRotation,
            flip: currentFlip,
            sideA: 0, sideB: 0, activeSide: 'A', status: 'raw'
        };
        setItemsOnPan([...itemsOnPan, newItem]);
    };

    // ==========================================
    // 🎯 ระบบลากป้อนเพื่อน (Drop to Player)
    // ==========================================
    const handleDropToPlayer = (e, targetPlayerId) => {
        e.preventDefault();
        const dataString = e.dataTransfer.getData('application/json');
        if (!dataString) return;

        const data = JSON.parse(dataString);

        if (data.source === 'pan') {
            const isCooked = data.status === 'cooked';

            // อัปเดตคะแนนคนโดนป้อน!
            setPlayers(prev => prev.map(p => {
                if (p.id === targetPlayerId) {
                    let pointChange = -50; // โทษฐานป้อนของดิบ/ของไหม้ (-50 แต้ม)
                    if (isCooked) pointChange = 100; // ป้อนของสุกอร่อย (+100 แต้ม)
                    return { ...p, score: p.score + pointChange };
                }
                return p;
            }));

            // ลบหมูชิ้นนั้นออกจากเตา
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

                                /* ==========================================
                                   🌟 ของใหม่: ส่งพิกัดรัวๆ ตลอดเวลาที่ลาก! 
                                   ========================================== */
                                onDrag={(e) => {
                                    // HTML5 Drag จะส่งค่า X,Y เป็น 0 ตอนเราปล่อยเมาส์ ต้องดักไว้ไม่ให้หมูเด้งไปมุมจอ
                                    if (e.clientX === 0 && e.clientY === 0) return;

                                    // คำนวณหาจุด X,Y ที่เมาส์ลากไปถึง
                                    const panRect = e.currentTarget.closest('.mookata-pan-area').getBoundingClientRect();
                                    const x = e.clientX - panRect.left;
                                    const y = e.clientY - panRect.top;

                                    /* 🔥 1. ท่อนนี้สำหรับส่งให้เพื่อน (ผ่าน Socket.io)
                                    คุณต้องเขียนโค้ดส่งข้อมูลประมานนี้ครับ:
                                    socket.emit('dragMeat', { uniqueId: item.uniqueId, x: x, y: y });
                                    */

                                    // 🔥 2. ท่อนนี้ทำให้จอคุณเห็นหมูลากตามเมาส์จริงๆ แบบเรียลไทม์!
                                    // (เอาไปแทนภาพวิญญาณลางๆ ของเบราว์เซอร์)
                                    setItemsOnPan(prev => prev.map(i => 
                                        i.uniqueId === item.uniqueId ? { ...i, x: x, y: y } : i
                                    ));
                                }}
                                /* ========================================== */

                                style={{ transform: `rotate(${item.rotation || 0}deg) scaleX(${item.flip || 1})` }} 
                            />
                        </div>
                    );
                })}
            </div>
            
            {/* 🌟 แถว Avatar ของเพื่อนร่วมห้อง */}
            <div className="players-action-board">
                {players.map(player => (
                    <div 
                        key={player.id}
                        className={`player-drop-zone ${player.isMe ? 'is-me' : ''}`}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDropToPlayer(e, player.id)}
                    >
                        <div className="player-avatar">{player.avatar}</div>
                        <div className="player-name">{player.name}</div>
                        <div className={`player-score ${player.score < 0 ? 'negative' : ''}`}>
                            ⭐ {player.score}
                        </div>
                    </div>
                ))}
            </div>

            <div className="pan-controls-mini">
                <button onClick={() => setItemsOnPan([])}>🧽 ล้างเตา</button>
            </div>
        </div>
    );
}

export default MookataPan;