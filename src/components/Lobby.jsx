import React, { useState } from 'react';
import { database } from '../firebase';
import { ref, set, get, child, update } from 'firebase/database';
import RuleModal from './game/RuleModal';

const Lobby = ({ playerName, setPlayerName, setRoomId, setGameState, setIsHost, setError, myId }) => {
    const [inputRoomId, setInputRoomId] = useState('');
    const [showRules, setShowRules] = useState(false);

    const createRoom = async () => {
        if (!playerName) {
            setError('Please enter your name');
            return;
        }

        // Generate simple 4-digit room code
        const newRoomId = Math.floor(1000 + Math.random() * 9000).toString();
        const newRoomRef = ref(database, `rooms/${newRoomId}`);

        try {
            await set(newRoomRef, {
                host: myId,
                status: 'waiting',
                createdAt: Date.now(),
                players: {
                    [myId]: {
                        name: playerName,
                        score: 0,
                        isHost: true
                    }
                }
            });
            setRoomId(newRoomId);
            setIsHost(true);
            setGameState('room');
            setError('');
        } catch (err) {
            console.error(err);
            setError('Failed to create room. Check console.');
        }
    };

    const joinRoom = async () => {
        if (!playerName) { setError('Please enter your name'); return; }
        if (!inputRoomId) { setError('Please enter a room code'); return; }

        const roomRef = ref(database, `rooms/${inputRoomId}`);
        try {
            const snapshot = await get(roomRef);
            if (snapshot.exists()) {
                const roomData = snapshot.val();
                if (roomData.status !== 'waiting') {
                    setError('Game already started');
                    return;
                }
                // Add self to players
                await update(child(roomRef, `players/${myId}`), {
                    name: playerName,
                    score: 0,
                    isHost: false
                });
                setRoomId(inputRoomId);
                setIsHost(false);
                setGameState('room');
                setError('');
            } else {
                setError('Room not found');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to join room');
        }
    };

    return (
        <div className="container" style={{ maxWidth: '400px' }}>
            {showRules && <RuleModal onClose={() => setShowRules(false)} />}

            <div style={{ position: 'relative', width: '100%', marginBottom: '2rem', textAlign: 'center' }}>
                <h1 style={{ margin: 0, border: 'none', fontSize: '3rem', letterSpacing: '0.1em', textShadow: '0 0 20px rgba(255,255,255,0.3)', color: '#fff' }}>LIAR GAME</h1>
                <p style={{ color: '#666', marginTop: '5px', fontSize: '0.9rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>라이어 게임</p>
            </div>

            <div className="card" style={{ padding: '2.5rem 2rem', border: '1px solid #333', background: '#050505', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                <button
                    onClick={() => setShowRules(true)}
                    style={{
                        position: 'absolute', top: '15px', right: '15px',
                        width: 'auto', padding: '5px', background: 'transparent',
                        border: 'none', fontSize: '1.2rem', color: '#666', cursor: 'pointer'
                    }}
                    title="게임 설명"
                >
                    📖
                </button>

                <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#fff', border: 'none', letterSpacing: '0.1em' }}>LOGIN</h2>
                    <div style={{ width: '30px', height: '2px', background: '#fff', margin: '15px auto' }}></div>
                </div>

                <div className="input-group" style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', textAlign: 'left', marginBottom: '8px', color: '#888', fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '0.05em' }}>NICKNAME</label>
                    <input
                        type="text"
                        placeholder="닉네임을 입력하세요"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        style={{ textAlign: 'center', fontSize: '1.1rem', padding: '12px', background: '#111', border: '1px solid #333', color: '#fff' }}
                    />
                </div>

                <div className="actions">
                    <button onClick={createRoom} style={{ background: '#fff', color: '#000', border: '1px solid #fff', fontSize: '1rem', fontWeight: 'bold' }}>
                        방 만들기
                    </button>

                    <div className="divider" style={{ margin: '1.5rem 0', color: '#444' }}>OR</div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            placeholder="CODE"
                            value={inputRoomId}
                            onChange={(e) => setInputRoomId(e.target.value)}
                            maxLength={4}
                            style={{
                                flex: 1, margin: 0, textAlign: 'center', letterSpacing: '0.2em',
                                background: '#111', border: '1px solid #333', color: '#fff',
                                textTransform: 'uppercase'
                            }}
                        />
                        <button onClick={joinRoom} className="secondary" style={{ flex: 1.5, margin: 0, border: '1px solid #888', color: '#ccc' }}>
                            입장하기
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '2rem', color: '#444', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center' }}>
                Made by 우철탄
            </div>
        </div>
    );
};

export default Lobby;
