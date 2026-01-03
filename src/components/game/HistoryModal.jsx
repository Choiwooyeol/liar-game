import React from 'react';

const HistoryModal = ({ gameData, onClose }) => {
    const answers = gameData.answers?.[`round${gameData.currentRound}`] || [];
    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.9)', zIndex: 200, padding: '2rem',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{ width: '90%', maxWidth: '500px', background: '#111', border: '1px solid #333', padding: '1rem', borderRadius: '8px', maxHeight: '80vh', overflowY: 'auto' }}>
                <h3 style={{ marginTop: 0, borderBottom: '1px solid #333', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                    📝 라운드 {gameData.currentRound} 기록
                    <button onClick={onClose} style={{ width: 'auto', padding: '2px 8px', fontSize: '1.2rem', background: 'transparent', border: 'none', color: 'red' }}>X</button>
                </h3>
                {answers && Object.values(answers).map((ans, idx) => (
                    <div key={idx} style={{ marginBottom: '10px', fontSize: '1rem', borderBottom: '1px solid #222', paddingBottom: '5px', textAlign: 'left' }}>
                        <strong style={{ color: '#fff' }}>{ans.name}</strong>: <span style={{ color: '#ccc' }}>{ans.text}</span>
                    </div>
                ))}
                {(!answers || Object.keys(answers).length === 0) && <p style={{ color: '#666' }}>아직 기록이 없습니다.</p>}
            </div>
        </div>
    );
};

export default HistoryModal;
