import { useState, useEffect } from 'react';
import './MyVibe.css';
import woodPattern from '../../../assets/Hub/cartoon-wood-pattern1.jpg';

const MyVibe = () => {
  // 1. สร้าง State เก็บค่าพลัง (เริ่มที่ 0 เพื่อให้หลอดวิ่งขึ้นตอนเปิดหน้าเว็บ)
  const [coffee, setCoffee] = useState(0);
  const [coding, setCoding] = useState(0);
  const [sleepy, setSleepy] = useState(0);

  // 2. แอนิเมชันตอนเริ่ม: หน่วงเวลาเล็กน้อยแล้ววิ่งไปค่าที่ตั้งไว้ (จะสมูทตาม CSS)
  useEffect(() => {
    const timer = setTimeout(() => {
      setCoffee(0);
      setCoding(0);
      setSleepy(0);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
  className="rpg-stats-container"
  /* ✅ ใส่เป็น prop style ตรงนี้เลยครับ */
  style={{
    backgroundImage: `url(${woodPattern})`, 
    backgroundSize: 'cover', 
    backgroundPosition: 'center',
    backgroundColor: '#FDE8C4'
  }}
>
  <h3 className="rpg-title">My Vibe 📖</h3>
      
      {/* หลอดที่ 1: Coffee */}
      <div className="rpg-stat-row">
         <span className="rpg-label">🌑 Sleepy</span>
         <div className="rpg-bar-bg">
            {/* แถบสีที่จะยืดหดตาม state */}
            <div className="rpg-bar-fill" style={{ width: `${coffee}%`, backgroundColor: '#363837' }}></div>
            {/* Range Input ซ่อนไว้ด้านบนเพื่อรับการกด/ลาก */}
            <input 
              type="range" min="0" max="100" 
              value={coffee} 
              onChange={(e) => setCoffee(Number(e.target.value))} 
              className="vibe-range-slider" 
            />
         </div>
         {/* ถ้าเต็ม 100 ให้แสดงคำว่า MAX */}
         <span className="rpg-percent">{coffee === 100 ? 'MAX' : `${coffee}%`}</span>
      </div>

      {/* หลอดที่ 2: Coding */}
      <div className="rpg-stat-row">
         <span className="rpg-label">🍜 Hungry </span>
         <div className="rpg-bar-bg">
            <div className="rpg-bar-fill" style={{ width: `${coding}%`, backgroundColor: '#c9584b' }}></div>
            <input 
              type="range" min="0" max="100" 
              value={coding} 
              onChange={(e) => setCoding(Number(e.target.value))} 
              className="vibe-range-slider" 
            />
         </div>
         <span className="rpg-percent">{coding === 100 ? 'MAX' : `${coding}%`}</span>
      </div>

      {/* หลอดที่ 3: Sleepy */}
      <div className="rpg-stat-row">
         <span className="rpg-label">😤 Energy </span> 
         <div className="rpg-bar-bg">
            <div className="rpg-bar-fill" style={{ width: `${sleepy}%`, backgroundColor: '#5db962' }}></div>
            <input 
              type="range" min="0" max="100" 
              value={sleepy} 
              onChange={(e) => setSleepy(Number(e.target.value))} 
              className="vibe-range-slider" 
            />
         </div>
         <span className="rpg-percent">{sleepy === 100 ? 'MAX' : `${sleepy}%`}</span>
      </div>
    </div>
  );
};

export default MyVibe;