import { useState, useEffect } from 'react';
import { apiRequest } from '../../../service/api'; 
import './MyVibe.css';
import woodPattern from '../../../assets/Hub/cartoon-wood-pattern1.jpg';

// 🌟 รับค่า isOwnProfile เข้ามา
const MyVibe = ({ userData, setUserData, isOwnProfile = true }) => {
  const [sleepy, setSleepy] = useState(0);
  const [hungry, setHungry] = useState(0);
  const [energy, setEnergy] = useState(0);

  useEffect(() => {
    if (userData && userData.vibe_sliders) {
      const timer = setTimeout(() => {
        setSleepy(userData.vibe_sliders.sleepy || 0);
        setHungry(userData.vibe_sliders.hungry || 0);
        setEnergy(userData.vibe_sliders.energy || 0);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [userData]);

  const saveVibeToDB = async (newVibe) => {
    // เซฟได้เฉพาะเจ้าของโปรไฟล์
    if (!isOwnProfile) return;

    try {
      await apiRequest('/profile', 'PUT', { vibe_sliders: newVibe });
      if (setUserData) {
        setUserData(prev => ({ ...prev, vibe_sliders: newVibe }));
      }
    } catch (error) {
      console.error("Failed to save vibe:", error);
    }
  };

  return (
    <div 
      className="rpg-stats-container"
      style={{
        backgroundImage: `url(${woodPattern})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        backgroundColor: '#FDE8C4'
      }}
    >
      <h3 className="rpg-title">My Vibe 📖</h3>
      
      <div className="rpg-stat-row">
         <span className="rpg-label">🌑 Sleepy</span>
         <div className="rpg-bar-bg">
            <div className="rpg-bar-fill" style={{ width: `${sleepy}%`, backgroundColor: '#363837' }}></div>
            <input 
              type="range" min="0" max="100" 
              value={sleepy} 
              onChange={(e) => setSleepy(Number(e.target.value))} 
              onMouseUp={() => saveVibeToDB({ sleepy, hungry, energy })} 
              onTouchEnd={() => saveVibeToDB({ sleepy, hungry, energy })} 
              className="vibe-range-slider" 
              disabled={!isOwnProfile} /* 🌟 ล็อคไม่ให้เพื่อนเลื่อน */
              style={{ cursor: isOwnProfile ? 'pointer' : 'default' }}
            />
         </div>
         <span className="rpg-percent">{sleepy === 100 ? 'MAX' : `${sleepy}%`}</span>
      </div>

      <div className="rpg-stat-row">
         <span className="rpg-label">🍜 Hungry </span>
         <div className="rpg-bar-bg">
            <div className="rpg-bar-fill" style={{ width: `${hungry}%`, backgroundColor: '#c9584b' }}></div>
            <input 
              type="range" min="0" max="100" 
              value={hungry} 
              onChange={(e) => setHungry(Number(e.target.value))} 
              onMouseUp={() => saveVibeToDB({ sleepy, hungry, energy })}
              onTouchEnd={() => saveVibeToDB({ sleepy, hungry, energy })}
              className="vibe-range-slider" 
              disabled={!isOwnProfile} /* 🌟 ล็อคไม่ให้เพื่อนเลื่อน */
              style={{ cursor: isOwnProfile ? 'pointer' : 'default' }}
            />
         </div>
         <span className="rpg-percent">{hungry === 100 ? 'MAX' : `${hungry}%`}</span>
      </div>

      <div className="rpg-stat-row">
         <span className="rpg-label">😤 Energy </span> 
         <div className="rpg-bar-bg">
            <div className="rpg-bar-fill" style={{ width: `${energy}%`, backgroundColor: '#5db962' }}></div>
            <input 
              type="range" min="0" max="100" 
              value={energy} 
              onChange={(e) => setEnergy(Number(e.target.value))} 
              onMouseUp={() => saveVibeToDB({ sleepy, hungry, energy })}
              onTouchEnd={() => saveVibeToDB({ sleepy, hungry, energy })}
              className="vibe-range-slider" 
              disabled={!isOwnProfile} /* 🌟 ล็อคไม่ให้เพื่อนเลื่อน */
              style={{ cursor: isOwnProfile ? 'pointer' : 'default' }}
            />
         </div>
         <span className="rpg-percent">{energy === 100 ? 'MAX' : `${energy}%`}</span>
      </div>
    </div>
  );
};

export default MyVibe;