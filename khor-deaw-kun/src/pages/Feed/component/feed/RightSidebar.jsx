import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../../../service/api'; 
import './RightSidebar.css';

function RightSidebar() {
    const [mutualFriends, setMutualFriends] = useState([]);
    const [trendingTags, setTrendingTags] = useState([]); // 🌟 State เก็บแท็กฮิต
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 🌟 1. ดึงเพื่อน Mutual
                const myProfile = await apiRequest('/profile', 'GET');
                if (myProfile && myProfile.following && myProfile.followers) {
                    const mutuals = myProfile.following.filter(username => 
                        myProfile.followers.includes(username)
                    );
                    setMutualFriends(mutuals);
                }

                // 🌟 2. ดึง Trending Tags
                const trendingData = await apiRequest('/trending', 'GET');
                if (trendingData) {
                    setTrendingTags(trendingData);
                }
            } catch (error) {
                console.error("Failed to fetch data for sidebar", error);
            }
        };

        fetchData();
    }, []);

    // ไอคอนสุ่มสำหรับตกแต่งแท็กให้ดูมีชีวิตชีวา
    const randomIcons = ['🔥', '✨', '🌊', '🍻', '💬', '🎉'];

    return (
        <div className="wooden-box right-sidebar">
            <h3 className="trending-title">🔥 Trending Topics</h3>
            <div className="tag-list">
                {trendingTags.length > 0 ? (
                    trendingTags.map((item, index) => {
                        // สุ่มไอคอนมาแปะท้ายแท็ก
                        const icon = randomIcons[index % randomIcons.length];
                        return (
                            <div key={index} className="tag-item" style={{ cursor: 'pointer' }}>
                                <span>{item.tag} <small style={{opacity: 0.5, fontSize: '0.7em'}}>({item.count})</small></span> 
                                <span>{icon}</span>
                            </div>
                        )
                    })
                ) : (
                    // ถ้ายังไม่มีใครติดแท็กเลย โชว์อันนี้แก้ขัด
                    <>
                        <div className="tag-item"><span>#ยังไม่มีแท็กฮิต</span> <span>👻</span></div>
                    </>
                )}
            </div>
            
            <h3 className="trending-title" style={{marginTop: '25px'}}>🟢 Friends</h3>
            <div className="buddy-list">
                {mutualFriends.length > 0 ? (
                    mutualFriends.map((friendName, index) => (
                        <div 
                            key={index} 
                            className="buddy-item"
                            style={{ cursor: 'pointer', transition: '0.2s' }}
                            onClick={() => navigate(`/profile/${friendName}`)} 
                            title={`ไปหน้าโปรไฟล์ของ ${friendName}`}
                        >
                            <span className="status-dot"></span> {friendName}
                        </div>
                    ))
                ) : (
                    <div style={{ opacity: 0.6, fontSize: '0.9rem', textAlign: 'center', marginTop: '15px' }}>
                        ยังไม่มีเพื่อนที่ฟอลกันและกันเลย 😢<br/>ลองไปกดฟอลเพื่อนดูสิ!
                    </div>
                )}
            </div>
        </div>
    );
}

export default RightSidebar;