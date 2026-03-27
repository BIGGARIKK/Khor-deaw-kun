import './RightPanel.css';

const RightPanel = ({ setIsStoryOpen, stories = [] }) => {
   const firstStoryImage = stories.length > 0 ? stories[0] : null;

   return (
      <div className="right-panel">
         
         {/* ================= กล่อง Story (My Story) ================= */}
         <div className="wooden-box polaroid-wrapper story-trigger" onClick={() => setIsStoryOpen(true)}>

            {firstStoryImage ? (
               <div style={{ position: 'relative', width: '100%', height: '180px' }}>

                  {stories.slice(1, 5).map((img, idx) => (
                     <div key={idx} style={{
                        position: 'absolute',
                        top: 0, left: 0,
                        width: '100%', height: '100%',
                        borderRadius: '8px',
                        border: '2px solid #fff',
                        boxShadow: '2px 2px 5px rgba(0,0,0,0.15)',
                        transform: `translate(${(idx + 1) * 3}px, ${(idx + 1) * 3}px) rotate(${idx % 2 === 0 ? 4 + idx : -4 - idx}deg)`,
                        zIndex: 5 - idx,
                        overflow: 'hidden',
                        backgroundColor: '#e6e6e6'
                     }}>
                        <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                     </div>
                  ))}

                  <div className="story-cover-wrapper" style={{
                     position: 'relative',
                     zIndex: 10,
                     backgroundImage: `url(${firstStoryImage})`,
                     backgroundSize: 'cover',
                     backgroundPosition: 'center',
                     borderRadius: '8px',
                     overflow: 'hidden',
                     height: '180px',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     border: '2px solid #fff',
                     boxShadow: '0px 0px 5px rgba(0,0,0,0.1)'
                  }}>
                     <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(8px)' }}></div>
                     <img
                        src={firstStoryImage}
                        alt="My Story"
                        style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', objectFit: 'contain' }}
                     />
                  </div>

               </div>
            ) : (
               <div className="story-placeholder-gray" style={{
                  width: '100%',
                  height: '180px',
                  backgroundColor: '#e6e6e6',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
               }}>
                  <span style={{ color: '#888', fontWeight: 'bold', fontSize: '0.9rem' }}>No Story Yet</span>
               </div>
            )}

            <div className="polaroid-caption">My Story ✨</div>
         </div>
         {/* ================= สิ้นสุดกล่อง Story ================= */}

      </div>
   );
};

export default RightPanel;