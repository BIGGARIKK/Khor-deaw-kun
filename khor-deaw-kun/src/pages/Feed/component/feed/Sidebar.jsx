import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
    const navigate = useNavigate();
    const activeRoom = localStorage.getItem('active_room');

    // 🌟 1. ใช้ State เดียวเก็บทั้ง 2 เควสต์
    const [quests, setQuests] = useState({
        cheersCount: 0,
        feedCount: 0
    });
    
    const target = 5;

    useEffect(() => {
        const loadQuests = () => {
            const today = new Date().toLocaleDateString();
            const savedDate = localStorage.getItem('quest_last_updated');

            if (savedDate !== today) {
                localStorage.setItem('quest_last_updated', today);
                localStorage.setItem('quest_cheers_count', '0');
                localStorage.setItem('quest_feed_count', '0');
                setQuests({ cheersCount: 0, feedCount: 0 });
            } else {
                setQuests({
                    cheersCount: parseInt(localStorage.getItem('quest_cheers_count') || '0'),
                    feedCount: parseInt(localStorage.getItem('quest_feed_count') || '0')
                });
            }
        };

        loadQuests();

        // 👂 ดักฟัง event จากหน้าอื่นๆ (เช่น ตอนป้อนหมู หรือ กด Cheers โพสต์)
        window.addEventListener('quest_updated', loadQuests);
        return () => window.removeEventListener('quest_updated', loadQuests);
    }, []);

    // เช็คว่าทำครบทุกอย่างหรือยัง
    const allCompleted = quests.cheersCount >= target && quests.feedCount >= target;

    return (
        <div className="left-sidebar">

            {/* 🏖️ Widget 1: สถานะโต๊ะของฉัน */}
            <div className="wooden-box widget-box">
                <div className="widget-header">
                    <h3>🥓 My Table</h3>
                    <span className="table-id" style={{ color: activeRoom ? '#dfdfdf' : '#A0A0A0' }}>
                        {activeRoom ? `#${activeRoom}` : '-'}
                    </span>
                </div>

                {activeRoom ? (
                    <>
                        <button
                            className="btn-wood-small"
                            style={{ backgroundColor: '#F48C2A', color: 'white', borderColor: '#3E2723' }}
                            onClick={() => navigate(`/room/${activeRoom}`)}
                        >
                            🏃‍♂️ กลับไปที่โต๊ะ
                        </button>
                    </>
                ) : (
                    <>
                        <div style={{ textAlign: 'center', padding: '15px 0', color: '#888', fontSize: '0.9rem', fontWeight: 'bold' }}>
                            คุณยังไม่ได้นั่งโต๊ะไหนเลย <br />
                            <span style={{ fontSize: '2rem' }}>🪑</span>
                        </div>
                        <button className="btn-wood-small" disabled style={{ backgroundColor: '#E0E0E0', color: '#A0A0A0', cursor: 'not-allowed', borderColor: '#C0C0C0' }}>
                            เลือกโต๊ะด้านขวาเลย!
                        </button>
                    </>
                )}
            </div>



            {/* 🏆 Widget 3: Daily Quests */}
            <div className="wooden-box widget-box">
                <div className="widget-header">
                    <h3>🏆 Daily Quests</h3>
                </div>

                {/* 🎯 เควสต์ที่ 1: ชนแก้ว */}
                <div style={{ marginBottom: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{
                            fontSize: '0.9rem',
                            fontWeight: 'bold',
                            color: quests.cheersCount >= target ? '#84E045' : '#3E2723',
                            textDecoration: quests.cheersCount >= target ? 'line-through' : 'none',
                            display: 'flex', alignItems: 'center', gap: '5px'
                        }}>
                            {quests.cheersCount >= target ? '✅' : '🍻'} ชนแก้วกับเพื่อน
                        </span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{quests.cheersCount}/{target}</span>
                    </div>
                    <div className="progress-bar-bg" style={{ backgroundColor: '#FFF0CC', height: '10px', borderRadius: '10px', border: '2px solid #3E2723', overflow: 'hidden' }}>
                        {/* 🌟 เติม className "progress-bar-fill" ตรงนี้ให้แล้ว! */}
                        <div 
                            className={`progress-bar-fill ${quests.cheersCount >= target ? 'completed' : ''}`}
                            style={{
                                width: `${Math.min(100, (quests.cheersCount / target) * 100)}%`,
                                backgroundColor: quests.cheersCount >= target ? '#84E045' : '#F48C2A',
                                height: '100%',
                                transition: 'width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                            }}
                        ></div>
                    </div>
                </div>

                {/* 🎯 เควสต์ที่ 2: ป้อนหมู */}
                <div style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{
                            fontSize: '0.9rem',
                            fontWeight: 'bold',
                            color: quests.feedCount >= target ? '#84E045' : '#3E2723',
                            textDecoration: quests.feedCount >= target ? 'line-through' : 'none',
                            display: 'flex', alignItems: 'center', gap: '5px'
                        }}>
                            {quests.feedCount >= target ? '✅' : '🥓'} ป้อนหมูให้เพื่อน
                        </span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{quests.feedCount}/{target}</span>
                    </div>
                    <div className="progress-bar-bg" style={{ backgroundColor: '#FFF0CC', height: '10px', borderRadius: '10px', border: '2px solid #3E2723', overflow: 'hidden' }}>
                        {/* 🌟 เติม className "progress-bar-fill" ตรงนี้ให้แล้ว! */}
                        <div 
                            className={`progress-bar-fill ${quests.feedCount >= target ? 'completed' : ''}`}
                            style={{
                                width: `${Math.min(100, (quests.feedCount / target) * 100)}%`,
                                backgroundColor: quests.feedCount >= target ? '#84E045' : '#F48C2A',
                                height: '100%',
                                transition: 'width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                            }}
                        ></div>
                    </div>
                </div>

                {/* 🌟 แสดงข้อความเมื่อทำครบหมด */}
                {allCompleted && (
                    <div className="quest-complete-msg">
                        🌟 วันนี้คุณสุดยอดมาก! 🌟
                    </div>
                )}
            </div>



        </div>
    );
}

export default Sidebar;