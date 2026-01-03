import React, { useState } from 'react';
import { database } from '../firebase';
import { ref, set, get, child, update } from 'firebase/database';
import { v4 as uuidv4 } from 'uuid';

const Lobby = ({ playerName, setPlayerName, setRoomId, setGameState, setIsHost, setError, myId }) => {
    const [inputRoomId, setInputRoomId] = useState('');

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
        <div className="container">
            <h1>라이어 게임</h1>
            <div className="card">
                <h2>대기실</h2>

                <div className="input-group">
                    <input
                        type="text"
                        placeholder="닉네임을 입력하세요"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                    />
                </div>

                <div className="actions">
                    <button onClick={createRoom}>방 만들기</button>
                    <div className="divider">또는</div>
                    <input
                        type="text"
                        placeholder="참여 코드 (예: 1234)"
                        value={inputRoomId}
                        onChange={(e) => setInputRoomId(e.target.value)}
                        maxLength={4}
                        style={{ width: '50%', margin: '0 auto' }}
                    />
                    <button onClick={joinRoom} className="secondary">방 입장하기</button>
                </div>
            </div>
            <div style={{ marginTop: '2rem', color: '#666', fontSize: '0.8rem' }}>
                Made by 우철탄
            </div>
        </div>
    );
};

export default Lobby;
