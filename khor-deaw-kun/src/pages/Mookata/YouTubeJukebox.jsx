import React, { useState, useEffect, useRef } from 'react';
import './YouTubeJukebox.css';

function YouTubeJukebox({ socket, roomId, myName }) {
    const [inputUrl, setInputUrl] = useState('');
    const [queue, setQueue] = useState([]);
    const [currentSong, setCurrentSong] = useState(null);
    const [volume, setVolume] = useState(50);
    const [isLoading, setIsLoading] = useState(false);

    const iframeRef = useRef(null);

    // --- Helpers ---

    const extractVideoID = (url) => {
        try {
            let videoId = null;
            if (url.includes('youtu.be/')) {
                videoId = url.split('youtu.be/')[1].split('?')[0];
            } else if (url.includes('shorts/')) {
                videoId = url.split('shorts/')[1].split('?')[0];
            } else if (url.includes('watch')) {
                videoId = new URLSearchParams(new URL(url).search).get('v');
            }
            return videoId;
        } catch {
            return null;
        }
    };

    const buildEmbedUrl = (videoId) =>
        `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&controls=0&enablejsapi=1`;

    const postToIframe = (message) => {
        iframeRef.current?.contentWindow?.postMessage(JSON.stringify(message), '*');
    };

    // --- Auto-play เพลงถัดไปเมื่อ currentSong ว่าง ---
    const playNext = () => setCurrentSong(null);

    useEffect(() => {
        if (!currentSong && queue.length > 0) {
            const [next, ...rest] = queue;
            setCurrentSong(next);
            setQueue(rest);
            socket?.emit('playing_next', { room_id: roomId, song: next });
        }
    }, [queue, currentSong, socket, roomId]);

    // --- รับฟัง YouTube iframe events ---
    useEffect(() => {
        const handleIframeMessage = (event) => {
            const origins = ['https://www.youtube-nocookie.com', 'https://www.youtube.com'];
            if (!origins.includes(event.origin)) return;
            try {
                const data = JSON.parse(event.data);
                if (data.event === 'infoDelivery' && data.info?.playerState === 0) {
                    playNext();
                }
            } catch { /* ignore */ }
        };
        window.addEventListener('message', handleIframeMessage);
        return () => window.removeEventListener('message', handleIframeMessage);
    }, []);

    // --- รับฟัง socket events ---
    useEffect(() => {
        if (!socket) return;
        socket.on('youtube_added_to_queue', (newSong) => setQueue((prev) => [...prev, newSong]));
        socket.on('youtube_skipped', playNext);
        return () => {
            socket.off('youtube_added_to_queue');
            socket.off('youtube_skipped');
        };
    }, [socket]);

    // --- เพิ่มเพลง ---
    const handleAddMusic = async (e) => {
        e.preventDefault();
        let url = inputUrl.trim();
        if (!url) return;
        if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;

        const videoId = extractVideoID(url);
        if (!videoId) {
            alert('ขอลิงก์ YouTube แท้ๆ หน่อยจ้า 🥺');
            return;
        }

        setIsLoading(true);
        const songData = {
            id: Date.now(),
            url: buildEmbedUrl(videoId),
            requester: myName,
            title: 'กำลังโหลด...',
        };

        try {
            const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
            const data = await res.json();
            songData.title = data.title || 'ไม่ทราบชื่อเพลง 🥺';
        } catch {
            songData.title = 'ไม่ทราบชื่อเพลง 🥺';
        } finally {
            setIsLoading(false);
        }

        setQueue((prev) => [...prev, songData]);
        socket?.emit('add_to_queue', { room_id: roomId, song: songData });
        setInputUrl('');
    };

    // --- Skip / Clear ---
    const handleSkip = () => {
        playNext();
        socket?.emit('skip_song', { room_id: roomId });
    };

    const handleClearQueue = () => {
        setCurrentSong(null);
        setQueue([]);
        socket?.emit('clear_queue', { room_id: roomId });
    };

    const handleRemoveFromQueue = (id) => setQueue((prev) => prev.filter((s) => s.id !== id));

    // --- Volume ---
    const handleVolumeChange = (e) => {
        const newVol = Number(e.target.value);
        setVolume(newVol);
        postToIframe({ event: 'command', func: 'setVolume', args: [newVol] });
    };

    const handleIframeLoad = () => {
        postToIframe({ event: 'command', func: 'setVolume', args: [volume] });
        postToIframe({ event: 'listening' });
    };

    // --- Render ---
    return (
        <div className="jukebox-wrapper">
        <div className="jukebox-container wooden-box">

            <div className="jukebox-header">🎵 ตู้เพลงริมหาด</div>

            {/* Form เพิ่มเพลง */}
            <form onSubmit={handleAddMusic} className="jukebox-form">
                <input
                    type="text"
                    placeholder="วางลิงก์ YouTube เพิ่มเข้าคิว..."
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    className="jukebox-input"
                    disabled={isLoading}
                />
                <button type="submit" className="btn btn-add" disabled={isLoading}>
                    {isLoading ? '⏳' : '➕ เพิ่มคิว'}
                </button>
            </form>

            {/* Video Player */}
            <div
                className="video-wrapper"
                style={{
                    height: currentSong ? '180px' : '0px',
                    marginBottom: currentSong ? '15px' : '0',
                }}
            >
                {currentSong && (
                    <>
                        <iframe
                            ref={iframeRef}
                            width="100%"
                            height="100%"
                            src={currentSong.url}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            onLoad={handleIframeLoad}
                        />
                        <div className="video-shield" />
                    </>
                )}
            </div>

            {/* Controls */}
            {currentSong && (
                <div className="controls-panel">
                    <div className="now-playing">🎶 {currentSong.title}</div>
                    <div className="dj-name">🎧 เปิดโดย: {currentSong.requester}</div>

                    <div className="volume-control">
                        <span>🔈</span>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="1"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="volume-slider"
                        />
                        <span>🔊</span>
                    </div>

                    <div className="action-buttons">
                        <button onClick={handleSkip} className="btn btn-skip">
                            ⏭️ ข้ามเพลง
                        </button>
                        <button onClick={handleClearQueue} className="btn btn-clear">
                            ⏹️ ปิด & ล้างคิว
                        </button>
                    </div>
                </div>
            )}

            {/* Queue */}
            <div className="queue-panel">
                <div className="queue-title">
                    <span>📋 คิวเพลง</span>
                    <span className="queue-count">{queue.length} เพลง</span>
                </div>

                {queue.length === 0 ? (
                    <div className="empty-queue">ยังไม่มีเพลงในคิว 🥺</div>
                ) : (
                    <ul className="queue-list">
                        {queue.map((song, index) => (
                            <li key={song.id} className="queue-item">
                                <span className="queue-number">{index + 1}</span>
                                <div className="queue-info">
                                    <span className="queue-title-text">{song.title}</span>
                                    <span className="queue-requester">🎧 {song.requester}</span>
                                </div>
                                <button
                                    onClick={() => handleRemoveFromQueue(song.id)}
                                    className="btn-remove"
                                    title="ลบออกจากคิว"
                                    aria-label={`ลบ ${song.title}`}
                                >
                                    ✖
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

        </div>
        </div>
    );
}

export default YouTubeJukebox;