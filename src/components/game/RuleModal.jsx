import React from 'react';

const RuleModal = ({ onClose }) => {
    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.9)', zIndex: 1000, padding: '1rem',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{
                width: '90%', maxWidth: '500px', background: '#000', border: '1px solid #fff',
                padding: '2rem', borderRadius: '4px', overflowY: 'auto', maxHeight: '80vh', position: 'relative'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '15px', marginBottom: '15px' }}>
                    <h2 style={{ margin: 0, color: '#fff', fontSize: '1.5rem', whiteSpace: 'nowrap' }}>
                        📖 게임 방법
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent', border: 'none', color: '#fff', fontSize: '2rem', cursor: 'pointer', lineHeight: '1', padding: '0 5px',
                            marginLeft: 'auto'
                        }}
                    >
                        &times;
                    </button>
                </div>

                <div style={{ color: '#ccc', lineHeight: '1.8', fontSize: '0.95rem' }}>
                    <p>
                        <strong>1. 시작 & 준비 (60초)</strong><br />
                        게임이 시작되면 60초의 준비 시간이 주어집니다.
                        <span style={{ color: '#fff' }}> '제시어 확인하기'</span> 버튼을 눌러 자신의 단어를 확인하세요.
                        라이어는 제시어가 보이지 않습니다.
                    </p>

                    <p>
                        <strong>2. 발언 진행</strong><br />
                        순서대로 돌아가며 제시어에 대해 한 문장씩 설명합니다.<br />
                        라이어는 정체를 들키지 않도록 그럴싸하게 거짓말을 해야 합니다.
                    </p>

                    <p>
                        <strong>3. 토론 & 투표</strong><br />
                        모든 라운드가 끝나면 투표를 통해 라이어를 찾아냅니다.<br />
                        최다 득표자는 심판대에 오르게 됩니다.
                    </p>

                    <p>
                        <strong>4. 최후의 변론 & 승패</strong><br />
                        - <strong style={{ color: '#fff' }}>라이어 지목 성공 시</strong>: 라이어에게 마지막 기회(제시어 맞추기)가 주어집니다. 맞추면 라이어 승, 틀리면 시민 승!<br />
                        - <strong style={{ color: '#fff' }}>엄한 시민 지목 시</strong>: 라이어의 즉시 승리!
                    </p>
                </div>

                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <button
                        onClick={onClose}
                        style={{
                            background: '#fff', color: '#000', fontWeight: 'bold',
                            padding: '10px 20px', border: 'none', cursor: 'pointer', borderRadius: '2px'
                        }}
                    >
                        알겠습니다!
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RuleModal;
