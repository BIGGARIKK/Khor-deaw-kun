import React from 'react';
import porkImg from '../../assets/Mookata/ingredients/pork.png'; 
import sausageImg from '../../assets/Mookata/ingredients/sausage.png'; 
import mushroomImg from '../../assets/Mookata/ingredients/mushroom.png'; 
import veggieImg from '../../assets/Mookata/ingredients/veggie.png'; 
import shrimpImg from '../../assets/Mookata/ingredients/shrimp.png'; 

function IngredientMenu({ selectedIngredient, onSelectIngredient, currentRotation, setCurrentRotation, currentFlip, setCurrentFlip }) {
    
    const ingredients = [
        { id: 'pork', name: 'หมูสามชั้น', image: porkImg },
        { id: 'sausage', name: 'ไส้กรอก', image: sausageImg }, 
        { id: 'mushroom', name: 'เห็ดเข็มทอง', image: mushroomImg }, 
        { id: 'veggie', name: 'ผักกาดขาว', image: veggieImg }, 
        { id: 'shrimp', name: 'กุ้งแม่น้ำ', image: shrimpImg }
    ];

    // 🌟 ฟังก์ชันเตรียมข้อมูลตอนเริ่มลาก (Drag Start)
    const handleDragStart = (e) => {
        const dragData = {
            ...selectedIngredient,
            rotation: currentRotation,
            flip: currentFlip
        };
        // ยัดข้อมูลใส่ไปกับการลากเมาส์
        e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    };

    return (
        <div className="ingredient-menu-wrapper">
            <div className="ingredient-menu">
                <div className="ingredient-grid">
                    {ingredients.map((item) => (
                        <button 
                            key={item.id}
                            className={`ingredient-btn ${selectedIngredient?.id === item.id ? 'active' : ''}`}
                            onClick={() => onSelectIngredient(item)} 
                        >
                            <img src={item.image} alt={item.name} className="ingredient-icon-img" />
                        </button>
                    ))}
                </div>
            </div>

            {selectedIngredient && (
                <div className="rotate-controls">
                    <p className="preview-text">จับลากลงเตา!</p>
                    
                    {/* 🌟 สั่งให้รูปนี้ draggable=true เพื่อจับลากได้ */}
                    <img 
                        src={selectedIngredient.image} 
                        alt="preview" 
                        className="preview-img draggable-item"
                        draggable="true" 
                        onDragStart={handleDragStart} 
                        style={{ transform: `rotate(${currentRotation}deg) scaleX(${currentFlip})` }} 
                    />
                    
                    <div className="control-btn-group">
                        <button className="tool-btn" onClick={() => setCurrentRotation(prev => prev + 45)}>🔄 หมุน (R)</button>
                        <button className="tool-btn" onClick={() => setCurrentFlip(prev => prev * -1)}>↔️ พลิก (F)</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default IngredientMenu;