import './RightPanel.css';
const RightPanel = ({ setIsStoryOpen }) => {
  return (
    <div className="right-panel">
      <div className="doodle-box polaroid-wrapper story-trigger" onClick={() => setIsStoryOpen(true)}>
        <div className="tape"></div>
        <img src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="My Cat" className="polaroid-img" />
        <div className="polaroid-caption">My Story ✨</div>
      </div>
    </div>
  );
};

export default RightPanel;