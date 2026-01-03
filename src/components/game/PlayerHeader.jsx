import React from 'react';

const PlayerHeader = ({ players, myId }) => (
    <div style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
        padding: '10px', borderBottom: '1px solid #333', zIndex: 100,
        display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap'
    }}>
        {Object.entries(players).map(([pid, p]) => (
            <span key={pid} style={{
                color: pid === myId ? '#fff' : '#888',
                fontWeight: pid === myId ? 'bold' : 'normal',
                fontSize: '0.8rem',
                border: pid === myId ? '1px solid #fff' : '1px solid transparent',
                padding: '2px 8px', borderRadius: '12px'
            }}>
                {p.name} {p.isHost && '👑'}
            </span>
        ))}
    </div>
);

export default PlayerHeader;
