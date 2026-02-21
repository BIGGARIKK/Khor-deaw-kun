import React from 'react'

function RightSidebar() {
  return (
    <div className="right-sidebar">
            {/* Trending Tags */}
            <div className="doodle-box">
                <h3 style={{ borderBottom: '3px solid #FFD500', display: 'inline-block' }}>Trending Tags</h3>
                <div className="tag-list">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>#inktober2023</span> <span style={{ border: '2px solid #111', borderRadius: '15px', padding: '0 8px', fontSize: '0.9rem' }}>1.2k</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>#minimalism</span> <span style={{ border: '2px solid #111', borderRadius: '15px', padding: '0 8px', fontSize: '0.9rem' }}>850</span>
                    </div>
                </div>
            </div>

            {/* Artist Spotlight */}
            <div className="doodle-box">
                <h3 style={{ borderBottom: '3px solid #FFD500', display: 'inline-block' }}>Artist Spotlight</h3>
                <div className="tag-list">
                     <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <div className="post-avatar"></div>
                        <strong style={{ fontSize: '1.1rem' }}>@line_master</strong>
                    </div>
                </div>
            </div>
        </div>
  )
}

export default RightSidebar