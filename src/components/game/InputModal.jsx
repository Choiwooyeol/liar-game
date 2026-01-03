import React from 'react';

const InputModal = ({ value, onChange, onSubmit }) => (
    <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.85)', zIndex: 150, padding: '1rem',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
    }}>
        <div style={{ width: '100%', maxWidth: '400px', background: '#000', border: '1px solid #fff', padding: '2rem', borderRadius: '4px' }}>
            <h2 style={{ marginTop: 0, color: '#fff', textAlign: 'center', borderBottom: '1px solid #333', paddingBottom: '15px' }}>📢 당신의 차례입니다</h2>
            <p style={{ color: '#ccc', textAlign: 'center', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                주제어에 대한 설명을 입력해주세요.<br />
                <span style={{ fontSize: '0.8rem', color: '#888' }}>(라이어라면 들키지 않게 조심하세요)</span>
            </p>

            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="설명 입력..."
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
                style={{ width: '100%', padding: '1rem', fontSize: '1rem', marginBottom: '1rem', background: '#111', border: '1px solid #444', color: '#fff', outline: 'none' }}
            />
            <button
                onClick={onSubmit}
                style={{ width: '100%', background: '#fff', color: '#000', fontWeight: 'bold', fontSize: '1rem', padding: '12px', border: 'none', cursor: 'pointer' }}
                onMouseOver={(e) => e.target.style.opacity = 0.9}
                onMouseOut={(e) => e.target.style.opacity = 1}
            >
                등록하기
            </button>
        </div>
    </div>
);

export default InputModal;
