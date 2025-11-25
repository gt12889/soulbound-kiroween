import React, { useState, useEffect } from 'react';

export const GhostVideoDebug: React.FC = () => {
  const [left, setLeft] = useState(10);
  const [top, setTop] = useState(40);
  const [width, setWidth] = useState(150);
  const [height, setHeight] = useState(150);
  const [opacity, setOpacity] = useState(0.9);
  const [videoFound, setVideoFound] = useState(false);
  const [videoInfo, setVideoInfo] = useState('');

  useEffect(() => {
    // Find the ghost video element - try multiple selectors
    let video = document.querySelector('video[src*="ghost"]') as HTMLVideoElement;
    
    if (!video) {
      // Try finding by class that contains 'ghost'
      const videos = document.querySelectorAll('video');
      video = Array.from(videos).find(v => 
        v.className.toLowerCase().includes('ghost') || 
        v.src.includes('ghost')
      ) as HTMLVideoElement;
    }

    if (video) {
      setVideoFound(true);
      const computed = getComputedStyle(video);
      const info = `Found! Class: ${video.className}\nSrc: ${video.src}\nComputed left: ${computed.left}\nComputed top: ${computed.top}`;
      setVideoInfo(info);
      console.log('Ghost video found:', video);
      console.log('Current styles:', {
        className: video.className,
        left: computed.left,
        top: computed.top,
        width: computed.width,
        height: computed.height,
        opacity: computed.opacity,
      });
    } else {
      setVideoFound(false);
      setVideoInfo('Video NOT found. Check console for all videos.');
      console.log('Ghost video NOT found');
      console.log('All videos on page:', document.querySelectorAll('video'));
    }
  }, []);

  useEffect(() => {
    let video = document.querySelector('video[src*="ghost"]') as HTMLVideoElement;
    if (!video) {
      const videos = document.querySelectorAll('video');
      video = Array.from(videos).find(v => 
        v.className.toLowerCase().includes('ghost') || 
        v.src.includes('ghost')
      ) as HTMLVideoElement;
    }
    
    if (video) {
      video.style.left = `${left}%`;
      video.style.top = `${top}%`;
      video.style.width = `${width}%`;
      video.style.height = `${height}%`;
      video.style.opacity = `${opacity}`;
      video.style.setProperty('left', `${left}%`, 'important');
      video.style.setProperty('top', `${top}%`, 'important');
    }
  }, [left, top, width, height, opacity]);

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'rgba(0, 0, 0, 0.9)',
      border: '2px solid #9d4edd',
      borderRadius: '8px',
      padding: '20px',
      zIndex: 9999,
      color: 'white',
      fontFamily: 'monospace',
      minWidth: '300px',
      maxHeight: '90vh',
      overflow: 'auto',
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#9d4edd' }}>Ghost Video Debug</h3>
      <div style={{ 
        marginBottom: '15px', 
        padding: '10px', 
        background: videoFound ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)',
        borderRadius: '4px',
        fontSize: '11px',
        whiteSpace: 'pre-wrap',
      }}>
        {videoInfo}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>
          Left: {left}%
        </label>
        <input
          type="range"
          min="-50"
          max="100"
          value={left}
          onChange={(e) => setLeft(Number(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>
          Top: {top}%
        </label>
        <input
          type="range"
          min="-50"
          max="100"
          value={top}
          onChange={(e) => setTop(Number(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>
          Width: {width}%
        </label>
        <input
          type="range"
          min="50"
          max="300"
          value={width}
          onChange={(e) => setWidth(Number(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>
          Height: {height}%
        </label>
        <input
          type="range"
          min="50"
          max="300"
          value={height}
          onChange={(e) => setHeight(Number(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>
          Opacity: {opacity.toFixed(2)}
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={opacity}
          onChange={(e) => setOpacity(Number(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      <button
        onClick={() => {
          console.log('Current values:', { left, top, width, height, opacity });
          alert(`CSS values:\nleft: ${left}%;\ntop: ${top}%;\nwidth: ${width}%;\nheight: ${height}%;\nopacity: ${opacity};`);
        }}
        style={{
          width: '100%',
          padding: '10px',
          background: '#9d4edd',
          border: 'none',
          borderRadius: '4px',
          color: 'white',
          cursor: 'pointer',
          marginTop: '10px',
        }}
      >
        Copy CSS Values
      </button>
    </div>
  );
};
